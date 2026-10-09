ALTER TABLE product_images ADD COLUMN media_type VARCHAR(16) NOT NULL DEFAULT 'IMAGE';
ALTER TABLE product_images ADD CONSTRAINT ck_product_media_type CHECK (media_type IN ('IMAGE', 'VIDEO'));
ALTER TABLE product_images ADD CONSTRAINT ck_product_video_not_primary CHECK (media_type <> 'VIDEO' OR NOT is_primary);
