package com.vanmoc.location.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "provinces", uniqueConstraints =
        @UniqueConstraint(name = "uk_provinces_codename", columnNames = "codename"))
public class ProvinceEntity {

    @Id
    private Integer code;

    private String name;

    @Column(name = "division_type")
    private String divisionType;

    private String codename;
}
