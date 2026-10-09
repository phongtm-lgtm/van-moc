package com.vanmoc.order.entity;

import com.vanmoc.product.enums.EngravingPosition;
import com.vanmoc.product.entity.ProductEntity;
import com.vanmoc.shared.persistence.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "order_items")
public class OrderItemEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", updatable = false)
    private OrderEntity order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", updatable = false)
    private ProductEntity product;

    @Column(name = "product_code", updatable = false)
    private String productCode;

    @Column(name = "product_name", updatable = false)
    private String productName;

    @Column(name = "product_image_url", updatable = false, columnDefinition = "text")
    private String productImageUrl;

    @Column(name = "unit_price", updatable = false, precision = 15, scale = 2)
    private BigDecimal unitPrice;

    @Column(updatable = false)
    private int quantity;

    @Column(name = "engraving_text", updatable = false, columnDefinition = "text")
    private String engravingText;

    @Column(name = "engraving_font", updatable = false)
    private String engravingFont;

    @Enumerated(EnumType.STRING)
    @Column(name = "engraving_position", updatable = false)
    private EngravingPosition engravingPosition;

    @Column(name = "engraving_unit_fee", updatable = false, precision = 15, scale = 2)
    private BigDecimal engravingUnitFee = BigDecimal.ZERO;

    @Column(name = "line_total", updatable = false, precision = 15, scale = 2)
    private BigDecimal lineTotal;
}
