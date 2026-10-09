-- Add a fixed selection of Vietnamese-capable Google Fonts without changing existing font codes,
-- product associations, or the names and activation choices of previously saved fonts.
-- Only assign sources to the original built-in entries when no custom source exists.
UPDATE engraving_fonts SET css_url = 'https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400&display=swap', font_family = 'Noto Serif', font_weight = 400, italic = false
WHERE code = 'SERIF' AND file_url IS NULL AND css_url IS NULL;
UPDATE engraving_fonts SET css_url = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400&display=swap', font_family = 'Dancing Script', font_weight = 400, italic = false
WHERE code = 'SCRIPT' AND file_url IS NULL AND css_url IS NULL;
UPDATE engraving_fonts SET css_url = 'https://fonts.googleapis.com/css2?family=Mali:wght@400&display=swap', font_family = 'Mali', font_weight = 400, italic = false
WHERE code = 'HANDWRITING' AND file_url IS NULL AND css_url IS NULL;

INSERT INTO engraving_fonts (id, created_at, updated_at, code, name, active, css_url, font_family, font_weight, italic) VALUES
 (gen_random_uuid(), now(), now(), 'BE_VIETNAM_PRO', 'Hiện đại', true, 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400&display=swap', 'Be Vietnam Pro', 400, false),
 (gen_random_uuid(), now(), now(), 'NOTO_SANS', 'Gọn gàng', true, 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400&display=swap', 'Noto Sans', 400, false),
 (gen_random_uuid(), now(), now(), 'NOTO_SERIF', 'Trang nhã', true, 'https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400&display=swap', 'Noto Serif', 400, false),
 (gen_random_uuid(), now(), now(), 'ROBOTO', 'Thanh thoát', true, 'https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap', 'Roboto', 400, false),
 (gen_random_uuid(), now(), now(), 'LORA', 'Mộc mạc', true, 'https://fonts.googleapis.com/css2?family=Lora:wght@400&display=swap', 'Lora', 400, false)
ON CONFLICT (code) DO NOTHING;
