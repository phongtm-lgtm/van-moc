package com.vanmoc.inventory.service;
import com.vanmoc.product.service.AdminProductService;
import com.vanmoc.product.repository.ProductJpaRepository;
import com.vanmoc.inventory.repository.StockMovementJpaRepository;
import com.vanmoc.inventory.entity.StockMovementEntity;
import com.vanmoc.inventory.enums.StockMovementReason;
import com.vanmoc.inventory.dto.request.StockAdjustmentRequest;
import com.vanmoc.inventory.dto.response.StockMovementResponse;
import com.vanmoc.user.repository.UserJpaRepository;
import com.vanmoc.shared.exception.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import java.util.UUID;
@Service
public class AdminInventoryService {
    private final AdminProductService admin;
    private final ProductJpaRepository products;
    private final StockMovementJpaRepository movements;
    private final UserJpaRepository users;
    public AdminInventoryService(AdminProductService admin,ProductJpaRepository products,StockMovementJpaRepository movements,UserJpaRepository users){this.admin=admin;this.products=products;this.movements=movements;this.users=users;}
    @Transactional public int adjust(UUID user,UUID product,StockAdjustmentRequest r){
        admin.requireAdmin(user);
        var p=products.lockById(product).orElseThrow(()->new ResourceNotFoundException("PRODUCT_NOT_FOUND"));
        long updated=(long)p.getStock()+r.delta();
        if(r.delta()==0||updated<0||updated>Integer.MAX_VALUE)throw new RuleException("INVALID_STOCK_ADJUSTMENT",HttpStatus.CONFLICT);
        p.setStock((int)updated);
        var m=new StockMovementEntity();m.setProduct(p);m.setQuantityChange(r.delta());m.setNote(r.note().trim());m.setReason(StockMovementReason.ADMIN_ADJUSTMENT);m.setChangedByUser(users.getReferenceById(user));movements.save(m);
        return p.getStock();
    }
    @Transactional(readOnly=true)public Page<StockMovementResponse> history(UUID user,UUID product,int page){
        admin.requireAdmin(user);
        if(!products.existsById(product))throw new ResourceNotFoundException("PRODUCT_NOT_FOUND");
        return movements.findByProductId(product,PageRequest.of(Math.max(0,page),20,Sort.by(Sort.Order.desc("createdAt"),Sort.Order.desc("id"))))
            .map(m->new StockMovementResponse(m.getId(),m.getQuantityChange(),m.getReason(),m.getNote(),m.getOrder()==null?null:m.getOrder().getId(),m.getChangedByUser()==null?null:m.getChangedByUser().getId(),m.getCreatedAt()));
    }
}
