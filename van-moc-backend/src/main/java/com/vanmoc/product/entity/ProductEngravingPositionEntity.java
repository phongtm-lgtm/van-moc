package com.vanmoc.product.entity;

import com.vanmoc.shared.persistence.BaseEntity;
import com.vanmoc.product.enums.EngravingPosition;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "product_engraving_positions", uniqueConstraints =
        @UniqueConstraint(name = "uk_product_engraving_positions", columnNames = {"product_id", "position"}))
public class ProductEngravingPositionEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private ProductEntity product;

    @Enumerated(EnumType.STRING)
    private EngravingPosition position;

    @Column(name = "max_chars")
    private Integer maxChars;

    @Column(name = "display_order")
    private int displayOrder;
}
