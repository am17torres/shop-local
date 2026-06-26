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

## Documentation

| Doc | What's in it |
| --- | --- |
| [docs/PLAN.md](docs/PLAN.md) | The full build plan: concept, phases, economics, risks. |
| [docs/DATA_MODEL.md](docs/DATA_MODEL.md) | Entities, key rules, and a concrete Postgres schema (DDL). |
| [docs/PAYMENT_FLOW.md](docs/PAYMENT_FLOW.md) | The confirm-before-charge Stripe Connect flow, state machine, and timeouts. |
| [docs/SEARCH.md](docs/SEARCH.md) | Full-text + typed faceted feature search design. |
| [docs/INVENTORY_MODEL.md](docs/INVENTORY_MODEL.md) | The three merchant inventory tiers and how they drive behavior. |

## Status

Planning / pre-build. The MVP scope and phasing live in
[docs/PLAN.md](docs/PLAN.md#phases). The economics are clear-eyed: at low volume,
fees won't cover delivery — early delivery is **subsidized community
infrastructure**, and unit economics only improve with route density.
