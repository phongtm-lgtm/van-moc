package com.vanmoc.product.service;

import com.vanmoc.product.dto.Engraving;
import com.vanmoc.product.entity.ProductEntity;
import com.vanmoc.product.repository.*;
import com.vanmoc.shared.exception.RuleException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.text.Normalizer;

@Service
public class EngravingService {
    private final ProductEngravingFontJpaRepository fonts;
    private final EngravingFontJpaRepository catalog;
    private final ProductEngravingPositionJpaRepository positions;
    public EngravingService(ProductEngravingFontJpaRepository fonts, ProductEngravingPositionJpaRepository positions, EngravingFontJpaRepository catalog) {
        this.fonts = fonts; this.positions = positions; this.catalog = catalog;
    }
    public Engraving validate(ProductEntity product, Engraving engraving) {
        if (engraving == null) return null;
        if (!product.isEngravingEnabled() || engraving.text() == null || engraving.font() == null || engraving.position() == null) invalid();
        var text = Normalizer.normalize(engraving.text(), Normalizer.Form.NFC).trim();
        // Explicit allowlist: letters, combining marks, digits, spaces and common punctuation. No controls/emoji.
        if (text.isEmpty() || !text.matches("[\\p{L}\\p{M}\\p{N} .,'’!?():;/&\\-]+")) invalid();
        if (!catalog.existsByCodeAndActiveTrue(engraving.font()) || fonts.findByProductIdOrderByDisplayOrderAscIdAsc(product.getId()).stream().noneMatch(f -> f.getFont().equals(engraving.font()))) invalid();
        var position = positions.findByProductIdOrderByDisplayOrderAscIdAsc(product.getId()).stream()
                .filter(p -> p.getPosition() == engraving.position()).findFirst().orElseThrow(() -> error());
        Integer limit = product.getEngravingMaxChars();
        if (position.getMaxChars() != null) limit = limit == null ? position.getMaxChars() : Math.min(limit, position.getMaxChars());
        if (limit != null && text.codePointCount(0, text.length()) > limit) invalid();
        return new Engraving(text, engraving.font(), engraving.position());
    }
    private void invalid() { throw error(); }
    private RuleException error() { return new RuleException("INVALID_ENGRAVING", HttpStatus.BAD_REQUEST); }
}
