CREATE TABLE engraving_fonts (
    id UUID PRIMARY KEY,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID,
    code VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    file_url TEXT,
    storage_key TEXT,
    active BOOLEAN NOT NULL DEFAULT true
);

INSERT INTO engraving_fonts (id, created_at, updated_at, code, name, active) VALUES
 (gen_random_uuid(), now(), now(), 'SERIF', 'Cổ điển', true),
 (gen_random_uuid(), now(), now(), 'SCRIPT', 'Uốn lượn', true),
 (gen_random_uuid(), now(), now(), 'HANDWRITING', 'Viết tay', true);
