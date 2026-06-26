# Data Model

Postgres-first. This doc lists the entities, the key invariants, and a concrete
schema sketch (DDL) you can build from. The DDL is a starting point for the
Phase 3 build — not a final migration.

## Key rules (invariants)

1. **Snapshot prices & names onto `order_items`.** A line item records the
   name and price *at order time* so later catalog edits never change history.
2. **Derive the parent `orders` status from its `merchant_orders`.** The
   customer-facing order is a roll-up; its status is computed, never written
   directly.
3. **`inventory_mode` drives behavior everywhere** — sync, stock display, and
   the checkout confirm step. See [INVENTORY_MODEL.md](INVENTORY_MODEL.md).

## Entities

| Entity | Purpose |
| --- | --- |
| `merchants` | Shop, Stripe Connect account, `inventory_mode`, `pos_provider`, confirm timeout. |
| `customers` | Buyers. |
| `addresses` | Customer addresses with an `in_delivery_zone` check. |
| `categories` | Hierarchical (ltree). |
| `products` | Catalog item per merchant; `search_vector`; `external_id` for POS sync. |
| `inventory` | Per-merchant sellable unit: price, quantity, `track_quantity`, `in_stock`, `last_synced_at`. |
| `feature_definitions` / `feature_options` / `product_features` | The searchable typed-feature system. |
| `orders` | Customer-facing whole; status **derived** from children. |
| `merchant_orders` | One per shop; holds the PaymentIntent and confirm/reject/expire state + `confirm_deadline`. |
| `order_items` | Line items tied to a merchant_order; **snapshot** name/price; per-line availability. |
| `delivery_windows` | Batched slots with cutoff + capacity. |
| `deliveries` | Driver route assignment with sequence/status. |
| `drivers` | Drivers. |

## Schema (DDL sketch)

```sql
CREATE EXTENSION IF NOT EXISTS ltree;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── Merchants ──────────────────────────────────────────────────────────────
CREATE TYPE inventory_mode  AS ENUM ('api_sync', 'periodic', 'confirm_only');
CREATE TYPE pos_provider    AS ENUM ('square', 'shopify', 'clover', 'lightspeed', 'none');

CREATE TABLE merchants (
    id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name                text NOT NULL,
    slug                text NOT NULL UNIQUE,
    stripe_account_id   text,                         -- Stripe Connect connected account
    inventory_mode      inventory_mode NOT NULL,
    pos_provider        pos_provider NOT NULL DEFAULT 'none',
    confirm_timeout     interval NOT NULL DEFAULT '2 hours',
    is_active           boolean NOT NULL DEFAULT true,
    created_at          timestamptz NOT NULL DEFAULT now()
);

-- ── Customers & addresses ──────────────────────────────────────────────────
CREATE TABLE customers (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email       text NOT NULL UNIQUE,
    phone       text,
    name        text,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE addresses (
    id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id       bigint NOT NULL REFERENCES customers(id),
    line1             text NOT NULL,
    line2             text,
    city              text NOT NULL,
    state             text NOT NULL,
    zip               text NOT NULL,
    in_delivery_zone  boolean NOT NULL DEFAULT false,
    created_at        timestamptz NOT NULL DEFAULT now()
);

-- ── Categories (hierarchical) ──────────────────────────────────────────────
CREATE TABLE categories (
    id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name    text NOT NULL,
    slug    text NOT NULL UNIQUE,
    path    ltree NOT NULL
);
CREATE INDEX categories_path_gist ON categories USING gist (path);

-- ── Products & inventory ───────────────────────────────────────────────────
CREATE TABLE products (
    id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    merchant_id    bigint NOT NULL REFERENCES merchants(id),
    category_id    bigint REFERENCES categories(id),
    name           text NOT NULL,
    description    text,
    brand          text,
    external_id    text,                              -- id in the merchant's POS
    search_vector  tsvector,
    created_at     timestamptz NOT NULL DEFAULT now(),
    UNIQUE (merchant_id, external_id)
);
CREATE INDEX products_search_gin ON products USING gin (search_vector);

CREATE TABLE inventory (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id      bigint NOT NULL REFERENCES products(id),
    price_cents     integer NOT NULL CHECK (price_cents >= 0),
    quantity        integer,                          -- null when not tracked
    track_quantity  boolean NOT NULL DEFAULT false,
    in_stock        boolean NOT NULL DEFAULT true,
    last_synced_at  timestamptz,
    UNIQUE (product_id)
);

-- ── Searchable typed-feature system ────────────────────────────────────────
CREATE TYPE feature_type AS ENUM ('text', 'number', 'boolean', 'enum');

CREATE TABLE feature_definitions (
    id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id  bigint NOT NULL REFERENCES categories(id),  -- category-scoped
    key          text NOT NULL,                              -- e.g. 'material', 'diameter'
    label        text NOT NULL,
    data_type    feature_type NOT NULL,
    unit         text,                                       -- e.g. 'in', 'lb'
    UNIQUE (category_id, key)
);

CREATE TABLE feature_options (
    id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    definition_id  bigint NOT NULL REFERENCES feature_definitions(id),
    value          text NOT NULL,                            -- enum choice → clean facet
    UNIQUE (definition_id, value)
);

CREATE TABLE product_features (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id      bigint NOT NULL REFERENCES products(id),
    definition_id   bigint NOT NULL REFERENCES feature_definitions(id),
    value_text      text,                                    -- typed columns keep
    value_number    numeric,                                 -- range/equality queries
    value_boolean   boolean,                                 -- correct
    value_option_id bigint REFERENCES feature_options(id),
    UNIQUE (product_id, definition_id)
);
CREATE INDEX product_features_def_num  ON product_features (definition_id, value_number);
CREATE INDEX product_features_def_opt  ON product_features (definition_id, value_option_id);

-- ── Orders ─────────────────────────────────────────────────────────────────
-- orders.status is DERIVED from merchant_orders; do not write it directly.
CREATE TYPE order_status          AS ENUM ('pending', 'partially_confirmed', 'confirmed', 'rejected', 'expired', 'cancelled');
CREATE TYPE merchant_order_status AS ENUM ('authorized', 'confirmed', 'rejected', 'expired');

CREATE TABLE delivery_windows (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    starts_at   timestamptz NOT NULL,
    ends_at     timestamptz NOT NULL,
    order_cutoff timestamptz NOT NULL,                -- order-by time for this loop
    capacity    integer NOT NULL,
    CHECK (ends_at > starts_at)
);

CREATE TABLE orders (
    id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id         bigint NOT NULL REFERENCES customers(id),
    address_id          bigint NOT NULL REFERENCES addresses(id),
    delivery_window_id  bigint REFERENCES delivery_windows(id),
    status              order_status NOT NULL DEFAULT 'pending',  -- derived roll-up
    delivery_fee_cents  integer NOT NULL DEFAULT 0,
    created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE merchant_orders (
    id                   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id             bigint NOT NULL REFERENCES orders(id),
    merchant_id          bigint NOT NULL REFERENCES merchants(id),
    stripe_payment_intent text,                        -- manual-capture PaymentIntent
    status               merchant_order_status NOT NULL DEFAULT 'authorized',
    confirm_deadline     timestamptz NOT NULL,         -- auto-cancel after this
    platform_fee_cents   integer NOT NULL DEFAULT 0,
    confirmed_at         timestamptz,
    created_at           timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX merchant_orders_deadline ON merchant_orders (confirm_deadline)
    WHERE status = 'authorized';                       -- drives the auto-cancel sweep

CREATE TABLE order_items (
    id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    merchant_order_id bigint NOT NULL REFERENCES merchant_orders(id),
    product_id        bigint REFERENCES products(id),
    name_snapshot     text NOT NULL,                   -- snapshot at order time
    price_cents_snapshot integer NOT NULL,             -- snapshot at order time
    quantity          integer NOT NULL CHECK (quantity > 0),
    available         boolean,                          -- per-line availability
    UNIQUE (merchant_order_id, product_id)
);

-- ── Delivery ───────────────────────────────────────────────────────────────
CREATE TABLE drivers (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name        text NOT NULL,
    phone       text NOT NULL,
    is_active   boolean NOT NULL DEFAULT true
);

CREATE TYPE delivery_status AS ENUM ('assigned', 'picked_up', 'delivered', 'failed');

CREATE TABLE deliveries (
    id                 bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id           bigint NOT NULL REFERENCES orders(id),
    driver_id          bigint REFERENCES drivers(id),
    delivery_window_id bigint NOT NULL REFERENCES delivery_windows(id),
    sequence           integer,                         -- stop order on the route
    status             delivery_status NOT NULL DEFAULT 'assigned'
);
```

## Notes on derived order status

`orders.status` is a roll-up of its `merchant_orders`:

- all `confirmed` → `confirmed`
- all `rejected` / `expired` → `rejected` / `expired`
- a mix of confirmed and not → `partially_confirmed`
- still waiting → `pending`

Keep this in one place (a view or a function invoked on `merchant_orders`
transitions) so the rule is never duplicated.
