# Personas & Capabilities

The people the Burnt Hills Local Marketplace serves, what each needs to be able
to do, and the user stories we hold ourselves to. These stories are the contract
the demo (and, later, the product) is tested against — see
[Traceability](#traceability-stories--tests) for the test that exercises them on
every pull request.

Status legend for each story:

- **✅ demo** — implemented in the interactive demo under [`site/`](../site) and
  covered by the e2e suite.
- **🟡 planned** — in scope per [`PLAN.md`](PLAN.md) / [`DATA_MODEL.md`](DATA_MODEL.md),
  not yet built.
- **⬜ later** — explicitly deferred (v2+).

---

## 1. Shopper / Customer

A Burnt Hills resident who wants to buy from local shops without calling around
or driving to five stores. Values convenience, knowing what's actually in stock,
and not being charged for something a shop can't fulfill.

**Goals:** find local goods fast, buy across shops in one go, choose how to
receive them, and know what's happening with the order.

| ID | User story | Status |
| --- | --- | --- |
| C1 | As a shopper, I can browse products from every shop in one storefront. | ✅ demo |
| C2 | As a shopper, I can filter by category, shop, and typed features (material, roast, organic, gluten-free, price) so I find exactly what I want. | ✅ demo |
| C3 | As a shopper, I can free-text search and have it match product attributes, not just names (e.g. "terracotta", "maple"). | ✅ demo |
| C4 | As a shopper, I can put items from multiple shops into one cart. | ✅ demo |
| C5 | As a shopper, I can choose **delivery** or **pick-up in store** per item. | ✅ demo |
| C6 | As a shopper, I see a **per-store** distance-based delivery fee ($1/mi from each shop to my address) that updates with my address, and pay none on pickup items. | ✅ demo |
| C7 | As a shopper, I can check out and have my card **authorized, not charged**, until each shop confirms. | ✅ demo |
| C8 | As a shopper, I can track each shop's part of my order independently (authorized → confirmed; delivery scheduled → out → delivered; pickup ready), reachable from the demo nav on any page. | ✅ demo |
| C9 | As a shopper, I receive SMS/email updates as my order changes. | 🟡 planned |
| C10 | As a shopper, I can create an account and reorder. | 🟡 planned |

## 2. Merchant / Shop Owner

A family-shop owner — the recruitment target. Time-poor, not technical, may track
stock on paper. Needs the platform to be near-zero effort and to never sell what
isn't there.

**Goals:** reach customers online without new software, keep their existing
register, and approve only what they can actually fulfill.

| ID | User story | Status |
| --- | --- | --- |
| M1 | As a merchant, I see incoming orders that are authorized and awaiting my confirmation. | ✅ demo |
| M2 | As a merchant, I can **confirm** an order, which captures payment. | ✅ demo |
| M3 | As a merchant, I can **reject** an order, which releases the hold with no charge. | ✅ demo |
| M4 | As a merchant, I only see and act on **my own** sub-order from a multi-shop cart. | ✅ demo |
| M5 | As a merchant, an unconfirmed order auto-cancels at its deadline so funds aren't held. | 🟡 planned |
| M6 | As a merchant, I get an SMS alert and can confirm by replying Y/N. | 🟡 planned |
| M7 | As a merchant on Square/Shopify/etc., my inventory syncs automatically. | 🟡 planned |
| M8 | As a merchant, I can do a partial confirm (some items in stock, some not). | ⬜ later |
| M9 | As a prospective merchant, I can use a pricing calculator to see what I'd net on an order at my revenue tier (platform fee + Stripe deducted). | ✅ demo |
| M10 | As a prospective merchant, I can submit a sign-up form (shop, contact, phone, address, what I sell, POS) to request becoming a launch partner. | ✅ demo |

## 3. Driver

The batched-loop courier. One accountable driver, one loop, to start. Needs a
clear day-list and to know the trip and the pay.

**Goals:** work an efficient route, know each stop, and see distance and fee.

| ID | User story | Status |
| --- | --- | --- |
| D1 | As a driver, I see a batched day-list of pickups (grouped by shop) and drop-offs. | ✅ demo |
| D2 | As a driver, each confirmed store sub-order is an independent stop I can advance on its own. | ✅ demo |
| D3 | As a driver, I can mark a stop **picked up** then **delivered**, and the customer sees the change. | ✅ demo |
| D4 | As a driver, I see the **distance and delivery fee** per drop-off (each store priced on its own store→address distance) and the day's totals. | ✅ demo |
| D5 | As a driver, pick-up-in-store items never appear on my route. | ✅ demo |
| D6 | As a driver, I get turn-by-turn navigation and an optimized stop order. | ⬜ later |
| D7 | As a prospective driver, I can apply to drive via a sign-up form (contact, vehicle, availability, license/insurance attestation). | ✅ demo |

## 4. Platform Operator / Dispatch

The marketplace itself (today: a person; increasingly: automation). Maintains the
catalog on merchants' behalf, defines the delivery zone and windows, and keeps
the loop running.

**Goals:** keep merchant effort near zero, concentrate demand into windows, and
keep deliveries reliable.

| ID | User story | Status |
| --- | --- | --- |
| P1 | As the operator, I maintain merchant catalogs so shops don't have to. | 🟡 planned |
| P2 | As the operator, I define delivery windows with cutoffs and capacity. | 🟡 planned |
| P3 | As the operator, I assign orders to a driver's loop and see the day's dispatch. | 🟡 planned |
| P4 | As the operator, I sort each merchant into an inventory tier (api_sync / periodic / confirm_only). | 🟡 planned |

## 5. AI Maintainer (meta)

This repo is AI-managed: agents build features, keep CI green, watch PRs, and
deploy. Not a product persona, but a real actor whose "capabilities" are the
guardrails in [`CLAUDE.md`](../CLAUDE.md).

| ID | Capability | Status |
| --- | --- | --- |
| A1 | Develop on a feature branch, open a PR, never commit to `main` directly. | ✅ |
| A2 | Keep every PR green on required checks before merge. | ✅ |
| A3 | Auto-deploy the demo from `main` and print the live URL after each merge. | ✅ |
| A4 | Keep `docs/` (this file included) in sync with behavior. | ✅ |

---

## Traceability: stories → tests

The ✅ stories above are exercised by the end-to-end suite in
[`tests/`](../tests), run by the **`e2e`** GitHub Actions check on every pull
request. Each spec file maps to a persona, and test titles cite the story IDs
(e.g. `C2`, `M4`, `D4`) so coverage stays honest:

| Persona | Spec | Stories covered |
| --- | --- | --- |
| Shopper | `tests/customer.spec.js` | C1–C8 |
| Merchant | `tests/merchant.spec.js` | M1–M4 |
| Merchant (pricing) | `tests/pricing.spec.js` | M9 |
| Merchant (sign-up) | `tests/merchant-signup.spec.js` | M10 |
| Driver | `tests/driver.spec.js` | D1–D5 |
| Driver (sign-up) | `tests/driver-signup.spec.js` | D7 |
| Cross-persona | `tests/end-to-end.spec.js` | full lifecycle (C7→M2→D3→C8) |

When a 🟡 story is built, add its test in the same spec and flip it to ✅ here in
the same PR.
