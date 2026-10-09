package com.vanmoc.inventory.entity;

import com.vanmoc.product.entity.ProductEntity;
import com.vanmoc.shared.persistence.BaseEntity;
import com.vanmoc.order.entity.OrderEntity;
import com.vanmoc.user.entity.UserEntity;
import com.vanmoc.inventory.enums.StockMovementReason;
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
@Table(name = "stock_movements")
public class StockMovementEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", updatable = false)
    private ProductEntity product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", updatable = false)
    private OrderEntity order;

    @Column(name = "quantity_change", updatable = false)
    private int quantityChange;

    @Enumerated(EnumType.STRING)
    @Column(updatable = false)
    private StockMovementReason reason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by_user_id", updatable = false)
    private UserEntity changedByUser;

    @Column(updatable = false, columnDefinition = "text")
    private String note;
}
