package com.vanmoc.order.entity;

import com.vanmoc.shared.persistence.BaseEntity;
import com.vanmoc.user.entity.UserEntity;
import com.vanmoc.order.enums.OrderStatus;
import com.vanmoc.order.enums.OrderStatusActorType;
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
@Table(name = "order_status_history")
public class OrderStatusHistoryEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", updatable = false)
    private OrderEntity order;

    @Enumerated(EnumType.STRING)
    @Column(name = "previous_status", updatable = false)
    private OrderStatus previousStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", updatable = false)
    private OrderStatus newStatus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by_user_id", updatable = false)
    private UserEntity changedByUser;

    @Enumerated(EnumType.STRING)
    @Column(name = "actor_type", updatable = false)
    private OrderStatusActorType actorType;

    @Column(updatable = false, columnDefinition = "text")
    private String note;
}
