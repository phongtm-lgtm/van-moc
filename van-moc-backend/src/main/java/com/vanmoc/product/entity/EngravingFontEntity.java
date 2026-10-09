package com.vanmoc.product.entity;

import com.vanmoc.shared.persistence.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "engraving_fonts")
public class EngravingFontEntity extends BaseEntity {
    private String code;
    private String name;
    @Column(name = "file_url", columnDefinition = "text")
    private String fileUrl;
    @Column(name = "storage_key", columnDefinition = "text")
    private String storageKey;
    @Column(name = "css_url", columnDefinition = "text")
    private String cssUrl;
    @Column(name = "font_family")
    private String fontFamily;
    @Column(name = "font_weight")
    private Integer fontWeight;
    private boolean italic;
    private boolean active = true;
}
