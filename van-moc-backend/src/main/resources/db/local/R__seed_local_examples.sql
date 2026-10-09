-- Local product examples only. Locations are initialized by LocationInitializer.

INSERT INTO categories(id, created_at, updated_at, name, slug, display_order, active)
VALUES ('10000000-0000-0000-0000-000000000001', now(), now(), 'Lược sừng', 'luoc-sung', 1, true),
       ('10000000-0000-0000-0000-000000000002', now(), now(), 'Trâm cài', 'tram-cai', 2, true) ON CONFLICT DO NOTHING;
INSERT INTO products(id, created_at, updated_at, category_id, code, slug, name,
                     description, material, price, stock, active,
                     engraving_enabled, engraving_max_chars, engraving_fee, version)
VALUES ('20000000-0000-0000-0000-000000000001', now(), now(),
        '10000000-0000-0000-0000-000000000001', 'VM-LS-001', 'luoc-sung-hoa-sen',
        'Lược sừng khắc hoa sen', 'Sản phẩm thủ công từ sừng tự nhiên.',
        'Sừng trâu tự nhiên', 320000, 12, true, true, 12, 50000, 0),
       ('20000000-0000-0000-0000-000000000002', now(), now(),
        '10000000-0000-0000-0000-000000000002', 'VM-TC-002', 'tram-cai-hoa-mai',
        'Trâm cài hoa mai', 'Trâm cài thủ công từ sừng tự nhiên.',
        'Sừng bò tự nhiên', 185000, 8, true, false, null, 0, 0) ON CONFLICT DO NOTHING;
INSERT INTO product_images(id, created_at, updated_at, product_id, image_url, display_order, is_primary)
VALUES ('30000000-0000-0000-0000-000000000001', now(), now(),
        '20000000-0000-0000-0000-000000000001', '/image/products/luoc-rang-thua.jpg', 0, true),
       ('30000000-0000-0000-0000-000000000002', now(), now(),
        '20000000-0000-0000-0000-000000000002', '/image/products/tram-hoa-sen.jpg', 0, true) ON CONFLICT DO NOTHING;
INSERT INTO product_engraving_fonts(id, created_at, updated_at, product_id, font, display_order)
VALUES ('40000000-0000-0000-0000-000000000001', now(), now(),
        '20000000-0000-0000-0000-000000000001', 'SERIF', 0),
       ('40000000-0000-0000-0000-000000000002', now(), now(),
        '20000000-0000-0000-0000-000000000001', 'SCRIPT', 1) ON CONFLICT DO NOTHING;
INSERT INTO product_engraving_positions(id, created_at, updated_at, product_id, position, max_chars, display_order)
VALUES ('50000000-0000-0000-0000-000000000001', now(), now(),
        '20000000-0000-0000-0000-000000000001', 'FRONT', 12, 0),
       ('50000000-0000-0000-0000-000000000002', now(), now(),
        '20000000-0000-0000-0000-000000000001', 'HANDLE', 8, 1) ON CONFLICT DO NOTHING;
