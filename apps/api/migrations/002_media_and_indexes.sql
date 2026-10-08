-- Generated product images are stored in the database so no extra file storage is needed.
CREATE TABLE generated_images (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mime       text NOT NULL,
  data       bytea NOT NULL,
  prompt     text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX carts_updated_idx ON carts(updated_at);
CREATE INDEX orders_created_idx ON orders(created_at);
CREATE INDEX orders_status_idx ON orders(status);
