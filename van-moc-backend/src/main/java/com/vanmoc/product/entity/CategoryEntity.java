package com.vanmoc.product.entity;

import com.vanmoc.shared.persistence.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "categories", uniqueConstraints =
        @UniqueConstraint(name = "uk_categories_slug", columnNames = "slug"))
public class CategoryEntity extends BaseEntity {

    private String name;

    private String slug;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "display_order")
    private int displayOrder;

    private boolean active = true;
}
