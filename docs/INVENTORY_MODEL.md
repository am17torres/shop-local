# Inventory Model — tiered by merchant capability

The platform runs **no custom POS**. Instead, each merchant is sorted into one
of three tiers based on what they already use to ring up sales. The tier
(`merchants.inventory_mode`) drives behavior everywhere — sync jobs, stock
display, and checkout.

## The three tiers

### 1. `api_sync`

Shops on **Square / Shopify / Clover / Lightspeed**.

- Pull live inventory via the POS API.
- Orders decrement stock.
- `inventory.track_quantity = true`, `last_synced_at` updated by the sync job.

### 2. `periodic`

Shops with a system but **no usable API**.

- Scheduled CSV export or store scrape.
- Some lag is expected between real stock and listed stock.
- `track_quantity` may be true, but counts are best-effort.

### 3. `confirm_only`

Shops on **paper** — no quantity tracking.

- No live quantity; listings are catalog-only.
- The **merchant confirmation at checkout *is* the stock check**.
- `inventory.track_quantity = false`.

## Why confirm-before-charge is universal

The merchant confirmation step (see [PAYMENT_FLOW.md](PAYMENT_FLOW.md)) is the
universal safety net **even for `api_sync` shops**, because small-shop counts
drift — the live number is often wrong by one or two. Confirm-before-charge
means a wrong count never results in a charged-but-unfulfillable order.

## How the tier drives behavior

| Concern | `api_sync` | `periodic` | `confirm_only` |
| --- | --- | --- | --- |
| Stock source | live API | scheduled export / scrape | none |
| `track_quantity` | true | true (best-effort) | false |
| Stock shown to customer | quantity / in-stock | in-stock (may lag) | "available to order" |
| Decrement on order | yes | on next sync | n/a |
| Confirm at checkout | yes (safety net) | yes | yes (the stock check) |
