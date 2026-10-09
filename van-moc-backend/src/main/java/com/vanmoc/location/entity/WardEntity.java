package com.vanmoc.location.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "wards", indexes =
        @Index(name = "idx_wards_province_code", columnList = "province_code"))
public class WardEntity {

    @Id
    private Integer code;

    private String name;

    @Column(name = "division_type")
    private String divisionType;

    private String codename;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "province_code")
    private ProvinceEntity province;
}
