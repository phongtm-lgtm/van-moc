package com.vanmoc.inventory.controller;
import com.vanmoc.inventory.service.AdminInventoryService;
import com.vanmoc.inventory.dto.request.StockAdjustmentRequest;
import com.vanmoc.inventory.dto.response.StockMovementResponse;
import com.vanmoc.user.service.AdminIdentity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import jakarta.validation.Valid;
import java.util.UUID;
@RestController
@RequestMapping("/api/admin/products/{id}/stock")
public class AdminInventoryController {
    private final AdminInventoryService inventory;
    public AdminInventoryController(AdminInventoryService inventory){this.inventory=inventory;}
    @PostMapping public int adjust(Authentication user,@PathVariable UUID id,@Valid @RequestBody StockAdjustmentRequest r){return inventory.adjust(AdminIdentity.id(user),id,r);}
    @GetMapping public Page<StockMovementResponse> history(Authentication user,@PathVariable UUID id,@RequestParam(defaultValue="0")int page){return inventory.history(AdminIdentity.id(user),id,page);}
}
