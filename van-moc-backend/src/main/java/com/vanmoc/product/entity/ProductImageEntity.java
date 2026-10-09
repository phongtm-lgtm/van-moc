package com.vanmoc.product.entity;

import com.vanmoc.shared.persistence.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "product_images")
public class ProductImageEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private ProductEntity product;

    @Column(name = "storage_key", columnDefinition = "text")
    private String storageKey;

    @Column(name = "image_url", columnDefinition = "text")
    private String imageUrl;

    @Column(name = "alt_text")
    private String altText;

    @Column(name = "display_order")
    private int displayOrder;

    @Column(name = "is_primary")
    private boolean primaryImage;

    @Column(name = "media_type")
    private String mediaType = "IMAGE";
}
