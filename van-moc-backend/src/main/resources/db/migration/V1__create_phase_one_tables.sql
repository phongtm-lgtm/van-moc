CREATE TABLE provinces (
    code INTEGER PRIMARY KEY, name VARCHAR(255), division_type VARCHAR(255),
    codename VARCHAR(255), CONSTRAINT uk_provinces_codename UNIQUE (codename)
);
CREATE TABLE wards (
    code INTEGER PRIMARY KEY, province_code INTEGER REFERENCES provinces(code),
    name VARCHAR(255), division_type VARCHAR(255), codename VARCHAR(255)
);
CREATE INDEX idx_wards_province_code ON wards(province_code);

CREATE TABLE users (
    id UUID PRIMARY KEY, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
    created_by UUID, updated_by UUID, google_subject VARCHAR(255), email TEXT,
    full_name VARCHAR(255), avatar_url TEXT, role VARCHAR(255), active BOOLEAN,
    CONSTRAINT uk_users_google_subject UNIQUE (google_subject),
    CONSTRAINT uk_users_email UNIQUE (email)
);
CREATE TABLE addresses (
    id UUID PRIMARY KEY, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
    created_by UUID, updated_by UUID, user_id UUID REFERENCES users(id),
    label VARCHAR(255), recipient_name VARCHAR(255), phone VARCHAR(255),
    ward_code INTEGER REFERENCES wards(code), address_line TEXT, is_default BOOLEAN
);
CREATE INDEX idx_addresses_user ON addresses(user_id);
CREATE UNIQUE INDEX uk_addresses_default ON addresses(user_id) WHERE is_default = true;

CREATE TABLE categories (
    id UUID PRIMARY KEY, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
    created_by UUID, updated_by UUID, name VARCHAR(255), slug VARCHAR(255),
    description TEXT, display_order INTEGER, active BOOLEAN,
    CONSTRAINT uk_categories_slug UNIQUE (slug)
);
CREATE TABLE products (
    id UUID PRIMARY KEY, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
    created_by UUID, updated_by UUID, category_id UUID REFERENCES categories(id),
    code VARCHAR(255), slug VARCHAR(255), name VARCHAR(255), short_description TEXT,
    description TEXT, material VARCHAR(255), price NUMERIC(15,2), stock INTEGER,
    active BOOLEAN, engraving_enabled BOOLEAN, engraving_max_chars INTEGER,
    engraving_fee NUMERIC(15,2), version BIGINT,
    CONSTRAINT uk_products_code UNIQUE(code), CONSTRAINT uk_products_slug UNIQUE(slug)
);
CREATE INDEX idx_products_category_active ON products(category_id, active);
CREATE TABLE product_images (
    id UUID PRIMARY KEY, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
    created_by UUID, updated_by UUID, product_id UUID REFERENCES products(id),
    storage_key TEXT, image_url TEXT, alt_text VARCHAR(255), display_order INTEGER,
    is_primary BOOLEAN
);
CREATE INDEX idx_product_images_product ON product_images(product_id, display_order);
CREATE UNIQUE INDEX uk_product_images_primary ON product_images(product_id) WHERE is_primary = true;
CREATE TABLE product_engraving_fonts (
    id UUID PRIMARY KEY, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
    created_by UUID, updated_by UUID, product_id UUID REFERENCES products(id),
    font VARCHAR(255), display_order INTEGER,
    CONSTRAINT uk_product_engraving_fonts UNIQUE(product_id, font)
);
CREATE TABLE product_engraving_positions (
    id UUID PRIMARY KEY, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
    created_by UUID, updated_by UUID, product_id UUID REFERENCES products(id),
    position VARCHAR(255), max_chars INTEGER, display_order INTEGER,
    CONSTRAINT uk_product_engraving_positions UNIQUE(product_id, position)
);
CREATE TABLE carts (
    id UUID PRIMARY KEY, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
    created_by UUID, updated_by UUID, user_id UUID REFERENCES users(id),
    CONSTRAINT uk_carts_user UNIQUE(user_id)
);
CREATE TABLE cart_items (
    id UUID PRIMARY KEY, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
    created_by UUID, updated_by UUID, cart_id UUID REFERENCES carts(id),
    product_id UUID REFERENCES products(id), quantity INTEGER, engraving_text TEXT,
    engraving_font VARCHAR(255), engraving_position VARCHAR(255)
);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE TABLE orders (
    id UUID PRIMARY KEY, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
    created_by UUID, updated_by UUID, order_code VARCHAR(255), user_id UUID REFERENCES users(id),
    status VARCHAR(255), payment_method VARCHAR(255), product_subtotal NUMERIC(15,2),
    engraving_total NUMERIC(15,2), shipping_fee NUMERIC(15,2), grand_total NUMERIC(15,2),
    recipient_name VARCHAR(255), recipient_phone VARCHAR(255),
    shipping_province_code INTEGER, shipping_province_name VARCHAR(255),
    shipping_ward_code INTEGER, shipping_ward_name VARCHAR(255), shipping_address_line TEXT,
    customer_note TEXT, idempotency_key VARCHAR(255), request_hash VARCHAR(255), version BIGINT,
    payment_expires_at TIMESTAMPTZ, confirmed_at TIMESTAMPTZ, processing_at TIMESTAMPTZ,
    ready_to_ship_at TIMESTAMPTZ, shipping_at TIMESTAMPTZ, completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ, CONSTRAINT uk_orders_order_code UNIQUE(order_code),
    CONSTRAINT uk_orders_user_idempotency_key UNIQUE(user_id, idempotency_key)
);
CREATE INDEX idx_orders_user_created ON orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status ON orders(status, created_at DESC);
CREATE TABLE order_items (
    id UUID PRIMARY KEY, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
    created_by UUID, updated_by UUID, order_id UUID REFERENCES orders(id),
    product_id UUID REFERENCES products(id), product_code VARCHAR(255),
    product_name VARCHAR(255), product_image_url TEXT, unit_price NUMERIC(15,2),
    quantity INTEGER, engraving_text TEXT, engraving_font VARCHAR(255),
    engraving_position VARCHAR(255), engraving_unit_fee NUMERIC(15,2), line_total NUMERIC(15,2)
);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
    created_by UUID, updated_by UUID, order_id UUID REFERENCES orders(id),
    previous_status VARCHAR(255), new_status VARCHAR(255),
    changed_by_user_id UUID REFERENCES users(id), actor_type VARCHAR(255), note TEXT
);
CREATE INDEX idx_order_history_order ON order_status_history(order_id, created_at);
CREATE TABLE payments (
    id UUID PRIMARY KEY, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
    created_by UUID, updated_by UUID, order_id UUID REFERENCES orders(id),
    method VARCHAR(255), provider VARCHAR(255), status VARCHAR(255),
    expected_amount NUMERIC(15,2), paid_amount NUMERIC(15,2), transfer_code VARCHAR(255),
    provider_transaction_id VARCHAR(255), expires_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ, failed_at TIMESTAMPTZ, version BIGINT,
    CONSTRAINT uk_payments_order UNIQUE(order_id),
    CONSTRAINT uk_payments_transfer_code UNIQUE(transfer_code),
    CONSTRAINT uk_payments_provider_transaction UNIQUE(provider_transaction_id)
);
CREATE INDEX idx_payments_expiry ON payments(status, expires_at);
CREATE TABLE payment_webhook_events (
    id UUID PRIMARY KEY, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
    created_by UUID, updated_by UUID, payment_id UUID REFERENCES payments(id),
    provider VARCHAR(255), provider_event_id VARCHAR(255), provider_transaction_id VARCHAR(255),
    transfer_code VARCHAR(255), amount NUMERIC(15,2), raw_payload JSONB,
    processing_status VARCHAR(255), failure_reason TEXT,
    received_at TIMESTAMPTZ, processed_at TIMESTAMPTZ,
    CONSTRAINT uk_webhook_provider_event UNIQUE(provider, provider_event_id),
    CONSTRAINT uk_webhook_provider_transaction UNIQUE(provider, provider_transaction_id)
);
CREATE INDEX idx_webhook_processing ON payment_webhook_events(processing_status, received_at);
CREATE TABLE stock_movements (
    id UUID PRIMARY KEY, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
    created_by UUID, updated_by UUID, product_id UUID REFERENCES products(id),
    order_id UUID REFERENCES orders(id), quantity_change INTEGER, reason VARCHAR(255),
    changed_by_user_id UUID REFERENCES users(id), note TEXT
);
CREATE INDEX idx_stock_product ON stock_movements(product_id, created_at);
CREATE INDEX idx_stock_order ON stock_movements(order_id);
