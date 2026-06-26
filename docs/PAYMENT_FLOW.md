# Payment Flow — confirm-before-charge

The foundational payment design is **authorize-and-capture with manual capture**
via Stripe Connect. The customer's card is authorized at checkout (a pending
hold) and only captured when the merchant confirms the stock is really there.

Every PaymentIntent is **per merchant_order** — a multi-merchant cart produces
one PaymentIntent per shop, each on that shop's connected account.

## Flow (per merchant_order)

1. **Checkout** → create a PaymentIntent with `capture_method: manual` →
   authorizes (a pending hold on the customer's card).
2. **Merchant alert** → the shop gets an SMS (Twilio) and a dashboard alert →
   they **Confirm** or **Reject**.
3. **Resolve:**
   - **Confirm** → capture the intent → `confirmed`.
   - **Reject** or **deadline passes** → cancel the intent →
     `rejected` / `expired`.
4. **Auto-cancel** on `confirm_deadline` (e.g. 2 hours) so funds aren't held
   indefinitely.
5. **Stripe Connect** — each shop is a connected account with its own
   authorization, capture, and payout.

## State machine (merchant_order)

```text
                 confirm (capture intent)
   authorized ───────────────────────────▶ confirmed
       │
       │ reject (cancel intent)
       ├───────────────────────────▶ rejected
       │
       │ confirm_deadline reached (cancel intent)
       └───────────────────────────▶ expired
```

- `authorized` — PaymentIntent created with manual capture; hold placed.
- `confirmed` — merchant confirmed; intent captured; goes to fulfillment.
- `rejected` — merchant declined; intent canceled; hold released.
- `expired` — `confirm_deadline` passed with no action; intent canceled.

The parent `orders` status is **derived** from its child `merchant_orders` — it
is never written directly. See [DATA_MODEL.md](DATA_MODEL.md).

## Checkout copy (support-ticket prevention)

> "You won't be charged until **[Shop]** confirms — you may see a temporary
> hold."

This single line is the main defense against the biggest customer-experience
risk: panic at seeing an authorization hold they don't understand.

## Deferred to v2

- **Partial capture** (e.g. 1 of 2 items in stock). For MVP, a merchant_order
  is confirmed or rejected as a whole.
