# Merchant Acquisition (the "sell" motion)

How we go from a live sign-up form to **3–4 committed launch-partner shops**.
This is the active, founder-led outreach playbook that sits *on top of* the
passive intake form documented in [PARTNER_INTAKE.md](PARTNER_INTAKE.md): the
form catches inbound interest; this doc is how we create it.

## Why merchants first

We're in **Phase 1 — Validate & recruit**, the *sell* step of demo → sell →
build. We sell supply before demand on purpose:

- **No inventory, nothing to buy.** A shopper-acquisition push with empty shelves
  burns the one thing a new marketplace can't rebuild — first impressions.
- **Merchants are the paying customer.** The platform fee is charged to the shop,
  so a merchant who commits is also our revenue relationship.
- **It resolves the chicken-and-egg.** Locked merchants give us real catalog to
  show shoppers later; demand promises don't give us shelves now.

Phase-1 target from [PLAN.md](PLAN.md#phase-1--validate--recruit): identify 8–15
shops, lock **3–4 diverse launch partners** in a tight delivery cluster.

## The offer (why saying yes is low-risk)

The whole pitch is that the shop takes on **no money risk, no software, and
almost no work**. Every claim below is already true and documented — keep them in
sync with the source if numbers change.

> **Design principle — visible value, fast, or they churn.** Our own founder left
> the Chamber of Commerce over *lack of perceived value*. That is exactly the
> objection every merchant will eventually have about us. So every partner must
> see something concrete — their storefront live, a real order — quickly, or
> they'll quietly disengage the same way. Recruiting a shop is the start of the
> job, not the finish.

- **Keep your register; learn nothing new.** We meet shops where they are via the
  tiered inventory model in [INVENTORY_MODEL.md](INVENTORY_MODEL.md). Square /
  Shopify / Clover / Lightspeed shops sync automatically (`api_sync`); shops with
  a system but no export send a periodic file (`periodic`); **paper-and-cash
  shops still qualify** as catalog-only (`confirm_only`).
- **No upfront cost. Pay only on orders you fulfill.** The platform fee starts at
  **1% and is capped at $100 for the year** at Tier 1, and scales 1% → 4% only as
  *your own* sales through us grow, with a hard annual cap at every tier (full
  table in [PLAN.md](PLAN.md#phase-2--operating-model)). If you reject an order,
  the customer's hold is released and **nobody is charged** — including you.
- **Near-zero effort.** We build and maintain your catalog. Your only job is to
  **confirm or reject** incoming orders (stories M1–M3 in
  [PERSONAS.md](PERSONAS.md)). A prospective owner can check the math themselves
  on the live pricing calculator (story M9).
- **You can never oversell.** Confirm-before-charge (see
  [PAYMENT_FLOW.md](PAYMENT_FLOW.md)) is the universal safety net: a card is only
  *authorized* at checkout and *captured* when you confirm stock, so a wrong count
  never becomes a charged, unfulfillable order.
- **Not exclusive.** Keep your own storefront, your walk-in trade, everything.

## Building the target list

Aim for 8–15 prospects, expecting to lock 3–4. Selection is driven by the
economics reality check in [PLAN.md](PLAN.md#economics-reality-check): unit
economics improve only with **route density**, so the early job is to
**concentrate demand, not maximize store count**.

**Eligibility gate — stores only, not service providers.** A prospect must sell
**physical goods we can list, cart, and deliver**. Retail shops, bakeries,
butchers, garden centers, pet-supply, bookstores all qualify; service businesses
do not — there's no inventory to put in a cart. This is **not** a catalog of tax
preparers, insurance agents/providers, fitness studios or gyms, salons, plumbers,
accountants, or sit-down restaurants. Apply this filter first, then prioritize
what's left:

1. **A tight geographic cluster** — shops one delivery loop can serve. A dense
   handful beats a scattered dozen.
2. **A complementary category mix** — so a single cross-store cart is natural and
   one loop fills several orders. Archetypes: garden / hardware, gift / home,
   bakery / specialty food, butcher / deli, pet supply, books / toys.
3. **Family-owned and time-poor** — exactly the persona the platform is built for
   (PERSONAS.md): wants reach without new software.

### Where to find them

Two different jobs: **sourcing names** (cold, scalable, automatable) and
**getting warm intros** (relationship-driven, where deals actually close).

**To source the raw list** (cross-reference across sources — a shop appearing in
several is easy to verify and likely active):

- **Google** — Maps / Business listings for the Burnt Hills–Ballston Lake area;
  filter to independent retail and food (skip chains, franchises, and service
  businesses). Listings also give address, hours, phone, and often the owner's
  name.
- **Online business catalogs** — town/village business directories, local "shop
  local" pages, Yelp, Facebook business pages, Main Street association lists.

**To get warm — this is where deals close:**

- **The BPA (primary channel).** We have a direct path in — use it. The goal is
  not its directory; it's an **endorsement**: a member email, a five-minute slot
  at a meeting, or a "preferred local platform" mention. One warm intro through
  the BPA beats fifty cold walk-ins.
- **Merchant referral.** Small-town owners trust each other far more than they'll
  trust us. Every locked partner gets asked for one introduction to another shop.
- **The Chamber of Commerce (optional, cold).** Area chamber listings exist, but
  our ties are weak — we were a member and didn't renew over low perceived value.
  Treat it as a backup name source, not a warm channel.

For each candidate, capture what the sources already reveal — name, category,
location, phone, and any hint of the POS/register they use — so the target table
starts pre-filled and the first conversation can skip the basics.

Track prospects here (a template — fill in real shops; don't invent names):

| Shop | Category | Location | POS guess | Likely tier | Contact | Stage |
| --- | --- | --- | --- | --- | --- | --- |
| *e.g. corner garden center* | Garden | *street/plaza* | Square | `api_sync` | *owner* | targeted |
| | | | | | | |

## The sell motion

Small town, so this is **founder-led and in person**. The funnel:

`targeted` → `conversation` → `demo shown` → `verbal yes` → `locked partner`

| Stage | The ask | The artifact | Next step |
| --- | --- | --- | --- |
| **targeted** | (internal) shortlist the shop | target table above | walk in |
| **conversation** | "Can I show you something for 5 minutes?" | one-page leave-behind | book a demo moment |
| **demo shown** | "Here's your shop in it." | personalized demo (below) | ask for a verbal yes |
| **verbal yes** | "Be one of our 3–4 launch partners — no cost to start." | the sign-up form | capture details |
| **locked partner** | confirm tier + sample catalog | intake row + their products | onboard |

Core tactics:

- **Walk in; lead with the demo, not a deck.** The live site at
  <https://am17torres.github.io/shop-local/> does the talking.
- **Personalize the demo — this is the closer.** Because the site is static, we
  can add the shop's *real* products to the demo catalog and show the owner their
  own storefront, then run the pricing calculator on a sample order at their tier
  so they see exactly what they'd net. Seeing themselves in it converts far better
  than any explanation. (A sell tactic, not a product build.)
- **Make the ask small.** "Be one of 3–4 launch partners, no cost to start" — not
  "sign a contract." Low commitment is the point in validation.
- **Ask the tier question early:** *"What do you ring up sales on today?"* The
  answer maps straight to the inventory tier (INVENTORY_MODEL.md) and tells us how
  much catalog work onboarding them takes.

## Handling objections

Every answer below is true today — don't oversell beyond it.

| Objection | Honest answer |
| --- | --- |
| "What's it cost me?" | 1% to start, capped at $100/year, and only on orders you actually fulfill. |
| "How much work is this?" | We build and maintain your catalog; you just confirm or reject orders (M1–M3). |
| "I'm on paper" / "I'm on Square" | All three tiers are welcome — paper shops list as catalog-only, POS shops sync. |
| "Will anyone actually buy?" | Straight answer: early delivery is subsidized community infrastructure while we build demand in time windows. You carry **zero** risk while we prove it. |
| "What if I'm out of stock?" | You can't get burned — confirm-before-charge means a wrong count never charges the customer or you. |
| "Am I locked in / exclusive?" | No. Keep your storefront and walk-in trade; leave anytime. |

## Tracking the pipeline (CRM)

One source of truth for every shop we touch, inbound or outbound. Don't stand up
a heavy tool for a 3–4-partner hunt — reuse what already exists.

### Where it lives

Extend the **Merchants tab** of the existing "BH Partner Sign-ups" Google Sheet
(see [PARTNER_INTAKE.md](PARTNER_INTAKE.md)). The intake form already appends
rows there, so it's the natural CRM: free, shareable, filterable, and it merges
our outbound sourcing with inbound sign-ups in one place. We add outreach columns
alongside the intake fields rather than maintaining a second list.

### Two inflows, one pipeline

- **Outbound** — shops we sourced (Google / BPA / Chamber / catalogs) and added
  ourselves. Start at stage `targeted`.
- **Inbound** — shops that submitted the sign-up form. Land via Apps Script;
  start at stage `verbal yes` (they raised their hand) and back-fill the rest.

**De-dup on email (then shop name):** if a sourced prospect later submits the
form, merge into the existing row rather than creating a second — keep the
earliest `first touch` and the furthest-along stage. A **Source** column
(`sourced` / `form`) records how each shop entered.

### Columns to add

On top of the intake fields (shop, contact, email, phone, address, what they
sell, POS/tier), add:

| Column | Purpose |
| --- | --- |
| Source | `sourced` or `form` |
| Stage | the funnel value below |
| First touch | date of first contact |
| Last touch | date of most recent contact |
| Next action | the single next step (e.g. "drop off one-pager") |
| Next action date | when it's due |
| Objections / notes | what they pushed back on, owner name, anything learned |
| Tier (confirmed) | `api_sync` / `periodic` / `confirm_only` once known |

### Stages = the funnel

The **Stage** column drives everything — a pivot/`COUNTIF` over it gives the
funnel for free, no separate tracker:

| Stage | Meaning |
| --- | --- |
| `targeted` | on the shortlist, not yet contacted |
| `conversation` | spoke with the owner |
| `demo shown` | showed them the (ideally personalized) demo |
| `verbal yes` | agreed to be a launch partner |
| `locked` | onboarded — tier set, sample catalog started · **goal: 3–4** |
| `passed` | declined or not a fit (keep the row + reason) |

Read the funnel for where to fix things: high `demo shown` but low `verbal yes`
means the *offer* needs work; few `conversation` rows means the *list or approach*
does.

### Keeping it current

Every contact updates **Last touch** and sets a **Next action** + date, so the
sheet doubles as the follow-up queue (sort by next-action date). Because the
project is AI-managed, an agent can append/normalize rows and summarize the
funnel on a cadence; a human logs the in-person touches.

### When to graduate

A sheet is right for dozens of prospects. If the pipeline outgrows it — more
partners, automated reminders, email threading — move to a **free dedicated CRM**
(HubSpot's free tier, or a Notion database) and import from the sheet. Don't pay
for one during validation.

## Running it autonomously (AI-operated)

This engine is built to run mostly unattended, on a schedule, using otherwise-idle
Claude tokens. The aim is a tireless back office — not a robot that closes deals.

### Division of labor

| AI owns (runs unattended) | Human owns |
| --- | --- |
| Sourcing shops from Google / catalogs; applying the eligibility gate; guessing tier; scoring cluster-fit | The in-person handshake and the close |
| Enriching + de-duping CRM rows, keeping the pipeline current | BPA relationship + asking for referrals |
| Drafting outreach, follow-ups, the one-page leave-behind | Approving anything that leaves the building |
| Generating each shop's **personalized demo** (catalog entries for the static site) | Logging in-person touches |
| Summarizing the funnel; flagging stale rows and what needs a human | Final go/no-go on the parameters below |

The close stays human on purpose: in a small town the founder's **name** is on
every interaction, so an agent blasting cold outbound is a reputational and
compliance risk, not a shortcut.

### The autonomy line (hybrid)

- **Internal work → fully automatic.** Sourcing, scoring, CRM upkeep, drafting,
  and demo-page *drafts* happen without approval.
- **Anything outward → one-click human approval.** Emails, texts, and publishing
  a personalized demo live wait in an **approval queue**; the agent prepares them,
  the human releases them.

### Operating parameters (the agent's spec)

These are the "give the AI some parameters" inputs. They double as the
success/kill criteria — the agent works toward the objective and stops or
escalates on the limits.

| Parameter | Example |
| --- | --- |
| **Objective** | Lock 3–4 launch partners within one delivery cluster |
| **Eligibility rules** | Goods stores only; the exclusions in "Building the target list" |
| **Sources** | Google, online catalogs (BPA/referrals are human-driven) |
| **Per-run budget** | A token/time cap per scheduled run |
| **Escalate when** | A lead reaches `verbal yes`; anything needs an outward action; data is ambiguous |
| **Stop when** | 4 partners locked, or the qualified-prospect pool is exhausted |
| **Kill signal** | Pool too thin to form a viable cluster → surface for a human strategy call, don't keep grinding |

### Cadence

Run as a scheduled background agent (a recurring routine / loop). Each run it
sources or enriches a batch, updates the CRM, drafts what's needed, and posts a
**daily digest**: new qualified prospects, the approval queue, stale follow-ups,
and the funnel counts. The human skims the digest, approves outward actions, and
does the in-person work the agent queued up.

This acquisition agent is the first piece of the broader goal — a largely
AI-operated marketplace — so keep its parameters and guardrails explicit enough
that the same pattern extends to later operations.

## What this is not

- **Not paid ads.** Validation is founder-led and face-to-face.
- **Not maximizing store count.** A dense, complementary cluster beats breadth —
  route density is the whole game early on.
- **Not a long-term commercial agreement.** This is the validation handshake; the
  durable fee/contract terms live with [PLAN.md](PLAN.md) economics.

## Related docs

- [PLAN.md](PLAN.md) — phases, economics, the fee tier table.
- [PARTNER_INTAKE.md](PARTNER_INTAKE.md) — the sign-up form, fields, and Sheet.
- [INVENTORY_MODEL.md](INVENTORY_MODEL.md) — the three merchant tiers.
- [PAYMENT_FLOW.md](PAYMENT_FLOW.md) — confirm-before-charge.
- [PERSONAS.md](PERSONAS.md) — the merchant persona and stories M1–M10.
