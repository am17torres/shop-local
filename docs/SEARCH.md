# Search & Faceted Features

The search experience is the platform's differentiator. Two layers are built
from **one dataset**, both in Postgres to start.

## Layer 1 — Full-text

A `tsvector` (`products.search_vector`) built from:

- product name
- description
- brand
- **a flattened dump of feature values**

Flattening feature values into the search vector means free-text search hits
attributes too — searching "terracotta" finds products whose *material feature*
is terracotta even if the word never appears in the description.

Indexed with a **GIN** index for fast full-text matching.

## Layer 2 — Structured faceted filtering (typed EAV)

A typed entity-attribute-value system that supports real feature-vs-feature
queries — e.g. `material = terracotta AND diameter BETWEEN 5 AND 7`, numeric
ranges, and boolean facets.

Three tables:

- **`feature_definitions`** — the typed vocabulary. Each definition has a
  data type (`text` / `number` / `boolean` / `enum`) and an optional unit
  (e.g. inches, lbs). **Category-scoped** so filters are relevant per category.
- **`feature_options`** — the allowed values for `enum` definitions, which
  become clean facet choices in the UI.
- **`product_features`** — the per-product typed values, stored in
  type-specific columns so range and equality queries stay correct.

See the DDL in [DATA_MODEL.md](DATA_MODEL.md#searchable-typed-feature-system).

## Why typed columns instead of a single value blob

Storing every value as text breaks numeric range queries (`"10" < "9"`
lexically) and boolean facets. `product_features` keeps separate
`value_text` / `value_number` / `value_boolean` / `value_option_id` columns and
reads the one matching the definition's data type. This keeps
`diameter BETWEEN 5 AND 7` a real numeric comparison.

## Category scoping

Features attach to categories, so the facet list a customer sees is relevant to
what they're browsing (pots show *material* and *diameter*; jam shows *flavor*
and *size*). Categories are hierarchical via `ltree`.

## Scaling path

Start in Postgres with GIN indexes — it comfortably handles a town's worth of
inventory. Graduate to **Meilisearch / Typesense** only when scale actually
demands it, not preemptively.
