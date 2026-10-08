CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  full_name     text NOT NULL,
  phone         text,
  role          text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,
  name        text NOT NULL,
  description text NOT NULL DEFAULT '',
  sort_order  int NOT NULL DEFAULT 0
);

CREATE TABLE products (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  text NOT NULL UNIQUE,
  name                  text NOT NULL,
  description           text NOT NULL,
  category_id           uuid NOT NULL REFERENCES categories(id),
  price_kobo            bigint NOT NULL CHECK (price_kobo >= 0),
  compare_at_price_kobo bigint CHECK (compare_at_price_kobo IS NULL OR compare_at_price_kobo > price_kobo),
  size                  text NOT NULL DEFAULT '',
  ingredients           text NOT NULL DEFAULT '',
  skin_types            text[] NOT NULL DEFAULT '{}',
  shades                text[] NOT NULL DEFAULT '{}',
  stock                 int NOT NULL DEFAULT 0 CHECK (stock >= 0),
  rating                numeric(2,1) NOT NULL DEFAULT 0,
  review_count          int NOT NULL DEFAULT 0,
  status                text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  is_featured           boolean NOT NULL DEFAULT false,
  is_new                boolean NOT NULL DEFAULT false,
  is_best_seller        boolean NOT NULL DEFAULT false,
  image_url             text,
  is_demo               boolean NOT NULL DEFAULT false,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON products(category_id);
CREATE INDEX products_name_idx ON products(lower(name));

CREATE TABLE product_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url         text NOT NULL,
  alt_text    text NOT NULL DEFAULT '',
  source      text NOT NULL DEFAULT 'upload' CHECK (source IN ('upload', 'huggingface')),
  sort_order  int NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE reviews (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating      int NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       text NOT NULL DEFAULT '',
  body        text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

CREATE TABLE wishlist_items (
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE carts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE cart_items (
  cart_id    uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   int NOT NULL CHECK (quantity > 0),
  PRIMARY KEY (cart_id, product_id)
);

CREATE TABLE coupons (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text NOT NULL UNIQUE,
  percent_off int CHECK (percent_off BETWEEN 1 AND 100),
  amount_off_kobo bigint CHECK (amount_off_kobo > 0),
  active      boolean NOT NULL DEFAULT true,
  expires_at  timestamptz
);

CREATE TABLE orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     text NOT NULL UNIQUE,
  user_id          uuid REFERENCES users(id),
  customer_name    text NOT NULL,
  email            text NOT NULL,
  phone            text NOT NULL,
  address          text NOT NULL,
  city             text NOT NULL,
  state            text NOT NULL,
  country          text NOT NULL DEFAULT 'Nigeria',
  subtotal_kobo    bigint NOT NULL,
  delivery_fee_kobo bigint NOT NULL,
  discount_kobo    bigint NOT NULL DEFAULT 0,
  total_kobo       bigint NOT NULL,
  status           text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled')),
  payment_status   text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid','paid','failed','refunded')),
  payment_reference text,
  is_demo          boolean NOT NULL DEFAULT false,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_user_idx ON orders(user_id);

CREATE TABLE order_items (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id     uuid REFERENCES products(id) ON DELETE SET NULL,
  product_name   text NOT NULL,
  unit_price_kobo bigint NOT NULL,
  quantity       int NOT NULL CHECK (quantity > 0)
);

CREATE TABLE store_settings (
  key   text PRIMARY KEY,
  value text NOT NULL
);

CREATE TABLE banners (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title      text NOT NULL,
  subtitle   text NOT NULL DEFAULT '',
  link_url   text NOT NULL DEFAULT '/shop',
  image_url  text,
  active     boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0
);

CREATE TABLE analytics_events (
  id         bigserial PRIMARY KEY,
  event_type text NOT NULL,
  path       text,
  product_id uuid,
  session_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX analytics_events_type_idx ON analytics_events(event_type, created_at);
