package com.vanmoc.user.entity;

import com.vanmoc.shared.persistence.BaseEntity;
import com.vanmoc.location.entity.WardEntity;
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
@Table(name = "addresses")
public class AddressEntity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    private String label;

    @Column(name = "recipient_name")
    private String recipientName;

    private String phone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ward_code")
    private WardEntity ward;

    @Column(name = "address_line", columnDefinition = "text")
    private String addressLine;

    @Column(name = "is_default")
    private boolean defaultAddress;
}
