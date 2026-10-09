ALTER TABLE products ADD COLUMN featured boolean NOT NULL DEFAULT false;

CREATE INDEX idx_products_featured_visible ON products (created_at DESC, id)
WHERE featured = true AND active = true;
