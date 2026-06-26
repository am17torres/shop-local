# CLAUDE.md

Guidance for Claude (and any AI agent) working in this repository.

## What this is

**shop-local** is the Burnt Hills Local Marketplace — a single web hub where
family-owned shops list inventory, customers shop across all of them in one
cart, and a batched local driver service delivers same-day. The project is
**AI-managed**: agents do the building, watch PRs, and keep CI green.

Status: **planning / pre-build.** The repo is currently documentation only.

## Read these first

- [`README.md`](README.md) — overview + the four locked decisions.
- [`docs/PLAN.md`](docs/PLAN.md) — phases, MVP scope, economics, risks.
- [`docs/DATA_MODEL.md`](docs/DATA_MODEL.md) — entities, invariants, Postgres DDL.
- [`docs/PAYMENT_FLOW.md`](docs/PAYMENT_FLOW.md) — confirm-before-charge flow.
- [`docs/SEARCH.md`](docs/SEARCH.md) — full-text + faceted feature search.
- [`docs/INVENTORY_MODEL.md`](docs/INVENTORY_MODEL.md) — the three merchant tiers.

## Locked decisions — do not relitigate without explicit sign-off

1. **No custom POS.** Meet shops via the tiered inventory model.
2. **Confirm-before-charge.** Stripe manual-capture: authorize at checkout,
   capture only on merchant confirmation.
3. **Multi-merchant carts split into per-merchant sub-orders**, each with its
   own confirmation and its own Stripe Connect PaymentIntent.
4. **Batched same-day delivery** in time windows, not on-demand.

When in doubt, treat `docs/` as the source of truth and keep it in sync with any
code you add.

## Conventions

- **Commits: Conventional Commits**, since releases are semantic-release driven.
  Use `feat:`, `fix:`, `docs:`, `ci:`, `chore:`, `refactor:`, `test:`. Breaking
  changes use `!` or a `BREAKING CHANGE:` footer. Documentation- and
  CI-only changes (`docs:` / `ci:` / `chore:`) must not imply a feature bump.
- **Branching:** never commit directly to `main`. Use a feature branch and open
  a PR. Do not create a PR unless the user asks.
- **Keep `docs/` authoritative.** New behavior gets documented alongside the
  code that introduces it.

## Checks — must pass before merge

- **Markdown lint:** `npx markdownlint-cli2 "**/*.md"` (config:
  `.markdownlint.json`). CI runs this on every PR via
  `.github/workflows/ci.yml`. Run it locally before pushing.
- As application code lands, extend `.github/workflows/ci.yml` with build,
  typecheck, and test jobs rather than adding separate workflows.

## When building (Phase 3, not yet started)

The data model in `docs/DATA_MODEL.md` is the starting point — generate
migrations from that DDL. Storefront/checkout is intended as Next.js + Stripe
Connect (or a multi-vendor platform); nothing is committed to a stack yet, so
confirm the choice before scaffolding.
