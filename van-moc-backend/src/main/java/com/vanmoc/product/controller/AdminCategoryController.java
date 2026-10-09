package com.vanmoc.product.controller;

import com.vanmoc.product.dto.request.AdminCategoryRequest;
import com.vanmoc.product.dto.request.AdminCategoryVisibilityRequest;
import com.vanmoc.product.dto.response.CategoryResponse;
import com.vanmoc.product.service.AdminCategoryService;
import com.vanmoc.user.service.AdminIdentity;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {
    private final AdminCategoryService categories;

    public AdminCategoryController(AdminCategoryService categories) { this.categories = categories; }

    @GetMapping
    public List<CategoryResponse> list(Authentication user) {
        return categories.list(AdminIdentity.id(user));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponse create(Authentication user, @Valid @RequestBody AdminCategoryRequest request) {
        return categories.create(AdminIdentity.id(user), request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(Authentication user, @PathVariable UUID id) {
        categories.delete(AdminIdentity.id(user), id);
    }

    @PatchMapping("/{id}/visibility")
    public CategoryResponse setVisibility(Authentication user, @PathVariable UUID id,
            @Valid @RequestBody AdminCategoryVisibilityRequest request) {
        return categories.setVisibility(AdminIdentity.id(user), id, request.active());
    }
}
