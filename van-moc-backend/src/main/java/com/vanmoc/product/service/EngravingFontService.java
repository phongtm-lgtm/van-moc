package com.vanmoc.product.service;

import com.vanmoc.product.dto.response.EngravingFontResponse;
import com.vanmoc.product.entity.EngravingFontEntity;
import com.vanmoc.product.repository.EngravingFontJpaRepository;
import com.vanmoc.shared.exception.ResourceNotFoundException;
import com.vanmoc.shared.exception.RuleException;
import com.vanmoc.user.enums.UserRole;
import com.vanmoc.user.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

@Service
public class EngravingFontService {
    private final EngravingFontJpaRepository fonts;
    private final UserService users;

    public EngravingFontService(EngravingFontJpaRepository fonts, UserService users) {
        this.fonts = fonts; this.users = users;
    }

    private void admin(UUID user) {
        if (users.me(user).role() != UserRole.ADMIN)
            throw new org.springframework.security.access.AccessDeniedException("Admin required");
    }

    private EngravingFontResponse response(EngravingFontEntity font) {
        return new EngravingFontResponse(font.getCode(), font.getName(), font.getFileUrl(), font.getCssUrl(),
                font.getFontFamily(), font.getFontWeight(), font.isItalic(), font.isActive());
    }

    @Transactional(readOnly = true)
    public List<EngravingFontResponse> publicFonts() {
        return fonts.findAllByOrderByNameAsc().stream().filter(EngravingFontEntity::isActive).map(this::response).toList();
    }

    @Transactional(readOnly = true)
    public List<EngravingFontResponse> adminFonts(UUID user) {
        admin(user);
        return fonts.findAllByOrderByNameAsc().stream().map(this::response).toList();
    }

    public EngravingFontResponse createGoogle(UUID user, String name, String input) {
        admin(user);
        if (name == null || name.isBlank() || name.trim().length() > 255 || input == null || input.length() > 4096)
            throw new RuleException("INVALID_FONT", HttpStatus.BAD_REQUEST);
        // Accept either the copied stylesheet URL or Google's complete embed snippet; never store arbitrary HTML.
        var matcher = java.util.regex.Pattern.compile("https://fonts\\.googleapis\\.com/css2\\?[^\\s\"'<>]+")
                .matcher(input.replace("&amp;", "&"));
        if (!matcher.find()) throw new RuleException("INVALID_FONT", HttpStatus.BAD_REQUEST);
        var url = matcher.group();
        try {
            var uri = URI.create(url);
            if (!"https".equals(uri.getScheme()) || !"fonts.googleapis.com".equals(uri.getHost())
                    || uri.getPort() != -1 || !"/css2".equals(uri.getPath()) || uri.getUserInfo() != null || uri.getFragment() != null)
                throw new IllegalArgumentException();
            var familyParam = java.util.Arrays.stream(uri.getRawQuery().split("&"))
                    .filter(part -> part.startsWith("family=")).toList();
            if (familyParam.size() != 1) throw new IllegalArgumentException();
            var familySpec = URLDecoder.decode(familyParam.getFirst().substring(7), StandardCharsets.UTF_8);
            var family = familySpec.split(":", 2)[0].trim();
            if (!family.matches("[\\p{L}0-9 ]{2,100}"))
                throw new IllegalArgumentException();
            var style = singleStyle(familySpec);
            // Build a canonical URL for the one variant selected on Google Fonts.
            var cssUrl = "https://fonts.googleapis.com/css2?family="
                    + java.net.URLEncoder.encode(family, StandardCharsets.UTF_8)
                    + (style.italic() ? ":ital,wght@1," : ":wght@") + style.weight()
                    + "&display=swap";
            var font = new EngravingFontEntity();
            font.setCode("FONT_" + UUID.randomUUID().toString().replace("-", "").toUpperCase(java.util.Locale.ROOT));
            font.setName(name.trim()); font.setCssUrl(cssUrl); font.setFontFamily(family);
            font.setFontWeight(style.weight()); font.setItalic(style.italic());
            return response(fonts.saveAndFlush(font));
        } catch (IllegalArgumentException exception) {
            throw new RuleException("INVALID_FONT", HttpStatus.BAD_REQUEST);
        }
    }

    private record GoogleStyle(int weight, boolean italic) {}

    private GoogleStyle singleStyle(String spec) {
        var parts = spec.split(":", 2);
        if (parts.length == 1) return new GoogleStyle(400, false);
        var axes = parts[1].split("@", -1);
        if (axes.length != 2 || !axes[1].matches("(?:[1-9]00|[01],[1-9]00)"))
            throw new IllegalArgumentException();
        if (axes[0].equals("wght") && axes[1].matches("[1-9]00"))
            return new GoogleStyle(Integer.parseInt(axes[1]), false);
        if (axes[0].equals("ital,wght") && axes[1].matches("[01],[1-9]00"))
            return new GoogleStyle(Integer.parseInt(axes[1].substring(2)), axes[1].charAt(0) == '1');
        throw new IllegalArgumentException();
    }

    @Transactional
    public EngravingFontResponse setActive(UUID user, String code, boolean active) {
        admin(user);
        var font = fonts.findByCode(code).orElseThrow(() -> new ResourceNotFoundException("FONT_NOT_FOUND"));
        font.setActive(active);
        return response(fonts.save(font));
    }
}
