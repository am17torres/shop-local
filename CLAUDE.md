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
- **After merging any PR, print the live demo URL** in the reply:
  <https://am17torres.github.io/shop-local/> (it auto-deploys from `main`).

## Checks — must pass before merge

- **Markdown lint:** `npx markdownlint-cli2 "**/*.md"` (rules in
  `.markdownlint.json`; scope in `.markdownlint-cli2.jsonc`). CI runs this on
  every PR via `.github/workflows/ci.yml`. Run it locally before pushing.
- **e2e user-story suite:** `npm test` (Playwright). The `e2e` CI job runs the
  persona user stories in [`tests/`](tests) on every PR. Each test cites a story
  ID from [`docs/PERSONAS.md`](docs/PERSONAS.md); keep the two in sync — when you
  add a story or change behavior, update both the spec and the personas doc in
  the same PR.
- As application code lands, extend `.github/workflows/ci.yml` with build and
  typecheck jobs rather than adding separate workflows.

## When building (Phase 3, not yet started)

The data model in `docs/DATA_MODEL.md` is the starting point — generate
migrations from that DDL. Storefront/checkout is intended as Next.js + Stripe
Connect (or a multi-vendor platform); nothing is committed to a stack yet, so
confirm the choice before scaffolding.

## Working style

Behavioral guidelines to reduce common LLM coding mistakes. They bias toward
caution over speed — for trivial tasks, use judgment.

### 1. Think before coding

**Don't assume. Don't hide confusion. Surface tradeoffs.** Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity first

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes,
simplify.

### 3. Surgical changes

**Touch only what you must. Clean up only your own mess.** When editing
existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.
- Remove imports/variables/functions that YOUR changes made unused, but don't
  remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the user's request.

### 4. Goal-driven execution

**Define success criteria. Loop until verified.** Transform tasks into
verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```text
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]
```

Strong success criteria let you loop independently; weak criteria ("make it
work") require constant clarification.

*Source: github.com/multica-ai/andrej-karpathy-skills — guidelines derived from
Andrej Karpathy's observations on LLM coding pitfalls.*
