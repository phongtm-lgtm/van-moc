CREATE TABLE shipping_rates (
    province_code INTEGER PRIMARY KEY,
    fee NUMERIC(15,2) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT ck_shipping_fee CHECK (fee >= 0 AND fee = trunc(fee)),
    CONSTRAINT ck_shipping_province CHECK (province_code >= 0)
);
-- Code 0 is the editable fallback, not a province from the location dataset.
INSERT INTO shipping_rates(province_code, fee) VALUES (0, 30000);
