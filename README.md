# shop-local — Burnt Hills Local Marketplace

A single web hub where family-owned businesses in the Burnt Hills area list
inventory, customers shop across all of them in **one cart**, and a **batched
local driver service** handles same-day delivery.

It solves the *"I have to call five shops or drive around to find what's in
stock"* problem with one searchable storefront for the town.

## The four locked decisions

1. **No custom POS.** Meet shops where they are via a tiered inventory model.
2. **Confirm-before-charge.** Stripe authorize-and-capture (manual capture):
   the card is authorized at checkout (a pending hold) and only captured when
   the merchant confirms stock.
3. **Multi-merchant carts split into per-merchant sub-orders**, each with its
   own confirmation and its own Stripe Connect PaymentIntent.
4. **Batched same-day delivery** in time windows (order-by cutoff → afternoon /
   evening loop), not on-demand.

## Demo site

An interactive **concept demo** (sample data, no backend) lives in
[`site/`](site/) and deploys to GitHub Pages. It's aimed at recruiting shop
owners and shows the whole flow: faceted storefront → single cross-shop cart →
confirm-before-charge checkout → merchant confirm/reject dashboard → live
customer order status.

To run locally: open `site/index.html`, or
`python3 -m http.server -d site 8000` and visit <http://localhost:8000>.

## Documentation

| Doc | What's in it |
| --- | --- |
| [docs/PERSONAS.md](docs/PERSONAS.md) | Who we serve, their capabilities, and the user stories the e2e suite tests. |
| [docs/PLAN.md](docs/PLAN.md) | The full build plan: concept, phases, economics, risks. |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | Entities, key rules, and a concrete Postgres schema (DDL). |
| [docs/PAYMENT_FLOW.md](docs/PAYMENT_FLOW.md) | The confirm-before-charge Stripe Connect flow, state machine, and timeouts. |
| [docs/SEARCH.md](docs/SEARCH.md) | Full-text + typed faceted feature search design. |
| [docs/INVENTORY_MODEL.md](docs/INVENTORY_MODEL.md) | The three merchant inventory tiers and how they drive behavior. |
| [docs/PARTNER_INTAKE.md](docs/PARTNER_INTAKE.md) | Merchant and driver sign-up forms: how submissions are collected, stored, and protected from spam. |

## Status

Planning / pre-build. The MVP scope and phasing live in
[docs/PLAN.md](docs/PLAN.md#phases). The economics are clear-eyed: at low volume,
fees won't cover delivery — early delivery is **subsidized community
infrastructure**, and unit economics only improve with route density.
