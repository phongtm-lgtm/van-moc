package com.vanmoc.shipping.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "shipping_rates")
public class ShippingRateEntity {
    @Id
    @Column(name = "province_code")
    private Integer provinceCode;
    @Column(precision = 15, scale = 2)
    private BigDecimal fee;
    @Version
    private long version;
}
