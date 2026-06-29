# Build Plan — Burnt Hills Local Marketplace

## Concept

A single web hub where family-owned businesses in the Burnt Hills area list
inventory, customers shop across all of them in one cart, and a batched local
driver service handles same-day delivery. Solves the "I have to call five shops
or drive around to find what's in stock" problem with one searchable storefront
for the town.

## Core decisions (locked)

- **No custom POS.** Meet shops where they are via a tiered inventory model
  (see [INVENTORY_MODEL.md](INVENTORY_MODEL.md)).
- **Confirm-before-charge** is the foundational payment design — Stripe
  authorize-and-capture (manual capture). The customer's card is authorized at
  checkout (a pending hold) and captured only when the merchant confirms stock.
  See [PAYMENT_FLOW.md](PAYMENT_FLOW.md).
- **Multi-merchant carts** split into per-merchant sub-orders, each with its own
  confirmation and its own Stripe Connect PaymentIntent.
- **Batched same-day delivery** in time windows (order-by cutoff → afternoon /
  evening loop), not on-demand.

## Search & features (the differentiator)

Two layers from one dataset (full detail in [SEARCH.md](SEARCH.md)):

- **Full-text** (Postgres `tsvector`): name + description + brand + a flattened
  dump of feature values, so free-text search hits attributes.
- **Structured faceted filtering** (typed EAV): `feature_definitions`,
  `feature_options`, `product_features`. Enables real feature-vs-feature
  queries — `material = terracotta AND diameter BETWEEN 5 AND 7`, numeric
  ranges, boolean facets.
- Features are **category-scoped** so filters are relevant per category.
- Start in Postgres (GIN indexes). Graduate to Meilisearch / Typesense only when
  scale demands.

## Phases

### Phase 1 — Validate & recruit (Weeks 1–4)

- Identify 8–15 family-owned shops with sellable goods.
- Collect interest via the merchant sign-up form (`partner.html#merchant`) and
  driver sign-up form (`partner.html#driver`); both feed a Google Sheet via Apps Script
  (see [PARTNER_INTAKE.md](PARTNER_INTAKE.md)). ✅ live on demo site
- Interview owners; lock 3–4 diverse launch partners. The founder-led outreach
  playbook for this is in [MERCHANT_ACQUISITION.md](MERCHANT_ACQUISITION.md).
- Define the delivery zone by ZIP / radius.
- Ask each owner **"what do you ring up sales on?"** to sort them into inventory
  tiers.

### Phase 2 — Operating model

- Finalize delivery batching windows.
- Driver sourcing: 1099 contract / courier partner / hybrid.
- Distance-based delivery fee: $1/mile from each store to the destination,
  priced per store sub-order (each store sits its own distance from the
  customer). In-store pickup is free.
- Platform fee: revenue-tiered, charged on each confirmed order's subtotal.
  Tier is set by cumulative revenue through the platform per calendar year
  (resets Jan 1), with a hard annual fee cap per tier:

  | Tier | Max annual revenue | Fee | Annual fee cap |
  | --- | --- | --- | --- |
  | 1 | $9,999 | 1% | $100 |
  | 2 | $99,999 | 2% | $2,000 |
  | 3 | $999,999 | 3% | $30,000 |
  | 4 | $9,999,999 | 4% | $400,000 |

- Stripe Connect payout split.

### Phase 3 — Build (Weeks 4–12)

- Multi-vendor storefront + single cross-store cart + checkout (multi-vendor
  platform like Webkul / Medusa / Bagisto, or custom Next.js + Stripe Connect).
- Postgres data model + search layer (full-text + faceted features).
- Merchant dashboard: listings + order alerts (Twilio SMS) + confirm/reject UI.
- Auth-then-capture + timeout / auto-cancel logic.
- Delivery dispatch: start with an admin view + driver texts; graduate to
  Onfleet / Circuit later.

**MVP scope (ruthlessly cut):** browse by store + category; faceted search;
single cart across stores; checkout + delivery window; merchant confirm; driver
day-list; customer SMS updates.

### Phase 4 — Launch (Weeks 12–16)

Soft launch to a small email list. Measure:

- orders / week
- stock-confirm failure rate
- delivery on-time rate
- repeat-customer rate

## Economics reality check

At low volume, fees won't cover delivery — early delivery is subsidized
community infrastructure, not a profit center. Unit economics improve only with
**route density** (more orders per loop). The early job is to concentrate demand
into time windows, **not** to maximize store count.

## Biggest risks

| Risk | Mitigation |
| --- | --- |
| **Inventory accuracy** | Confirm-before-charge protects you. |
| **Driver reliability** | One accountable driver, one loop, to start. |
| **Merchant effort** | Keep their side near-zero; you maintain the catalog, they just confirm / fulfill. |
| **Customer panic at auth holds** | Clear checkout copy about the temporary hold. |
