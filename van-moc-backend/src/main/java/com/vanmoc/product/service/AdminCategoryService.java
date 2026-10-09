package com.vanmoc.product.service;

import com.vanmoc.product.dto.request.AdminCategoryRequest;
import com.vanmoc.product.dto.response.CategoryResponse;
import com.vanmoc.product.entity.CategoryEntity;
import com.vanmoc.product.mapper.ProductMapper;
import com.vanmoc.product.repository.CategoryJpaRepository;
import com.vanmoc.product.repository.ProductJpaRepository;
import com.vanmoc.shared.exception.ResourceNotFoundException;
import com.vanmoc.shared.exception.RuleException;
import com.vanmoc.user.enums.UserRole;
import com.vanmoc.user.service.UserService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class AdminCategoryService {
    private final CategoryJpaRepository categories;
    private final ProductJpaRepository products;
    private final UserService users;

    public AdminCategoryService(CategoryJpaRepository categories, ProductJpaRepository products, UserService users) {
        this.categories = categories;
        this.products = products;
        this.users = users;
    }

    private void requireAdmin(UUID user) {
        if (users.me(user).role() != UserRole.ADMIN)
            throw new org.springframework.security.access.AccessDeniedException("Admin required");
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> list(UUID user) {
        requireAdmin(user);
        return categories.findAllByOrderByDisplayOrderAscNameAsc().stream()
                .map(ProductMapper::toResponse).toList();
    }

    @Transactional
    public CategoryResponse create(UUID user, AdminCategoryRequest request) {
        requireAdmin(user);
        var category = new CategoryEntity();
        category.setName(request.name().trim());
        category.setSlug(request.slug());
        category.setActive(true);
        category.setDisplayOrder(categories.findAllByOrderByDisplayOrderAscNameAsc().stream()
                .mapToInt(CategoryEntity::getDisplayOrder).max().orElse(0) + 1);
        if (categories.existsBySlug(request.slug()))
            throw new RuleException("CATEGORY_SLUG_EXISTS", HttpStatus.CONFLICT);
        try {
            return ProductMapper.toResponse(categories.saveAndFlush(category));
        } catch (DataIntegrityViolationException exception) {
            throw new RuleException("CATEGORY_SLUG_EXISTS", HttpStatus.CONFLICT);
        }
    }

    @Transactional
    public CategoryResponse setVisibility(UUID user, UUID id, boolean active) {
        requireAdmin(user);
        var category = categories.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CATEGORY_NOT_FOUND"));
        category.setActive(active);
        return ProductMapper.toResponse(categories.save(category));
    }

    @Transactional
    public void delete(UUID user, UUID id) {
        requireAdmin(user);
        var category = categories.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CATEGORY_NOT_FOUND"));
        if (products.existsByCategoryId(id))
            throw new RuleException("CATEGORY_HAS_PRODUCTS", HttpStatus.CONFLICT);
        categories.delete(category);
    }
}
