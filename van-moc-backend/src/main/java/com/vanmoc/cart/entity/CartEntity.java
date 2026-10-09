package com.vanmoc.cart.entity;

import com.vanmoc.shared.persistence.BaseEntity;
import com.vanmoc.user.entity.UserEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "carts", uniqueConstraints =
        @UniqueConstraint(name = "uk_carts_user", columnNames = "user_id"))
public class CartEntity extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;
}
