package com.vanmoc.product.entity;

import com.vanmoc.shared.persistence.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "products", uniqueConstraints = {
        @UniqueConstraint(name = "uk_products_code", columnNames = "code"),
        @UniqueConstraint(name = "uk_products_slug", columnNames = "slug")
})
public class ProductEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private CategoryEntity category;

    private String code;

    private String slug;

    private String name;

    @Column(name = "short_description", columnDefinition = "text")
    private String shortDescription;

    @Column(columnDefinition = "text")
    private String description;

    private String material;

    @Column(precision = 15, scale = 2)
    private BigDecimal price;

    private int stock;

    private boolean active = true;

    @Column(name = "engraving_enabled")
    private boolean engravingEnabled;

    @Column(name = "engraving_max_chars")
    private Integer engravingMaxChars;

    @Column(name = "engraving_fee", precision = 15, scale = 2)
    private BigDecimal engravingFee = BigDecimal.ZERO;

    @Version
    private long version;
}
