package com.vanmoc.cart.entity;

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

@Getter
@Setter
@Entity
@Table(name = "cart_items")
public class CartItemEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id")
    private CartEntity cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private ProductEntity product;

    private int quantity;

    @Column(name = "engraving_text", columnDefinition = "text")
    private String engravingText;

    @Column(name = "engraving_font")
    private String engravingFont;

    @Enumerated(EnumType.STRING)
    @Column(name = "engraving_position")
    private EngravingPosition engravingPosition;
}
