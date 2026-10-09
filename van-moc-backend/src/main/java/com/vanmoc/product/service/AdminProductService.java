package com.vanmoc.product.service;
import com.vanmoc.product.repository.*;
import com.vanmoc.product.entity.*;
import com.vanmoc.product.dto.request.AdminProductRequest;
import com.vanmoc.product.dto.response.AdminProductResponse;
import com.vanmoc.product.mapper.ProductMapper;
import com.vanmoc.user.service.UserService;
import com.vanmoc.user.enums.UserRole;
import com.vanmoc.cart.repository.CartItemJpaRepository;
import com.vanmoc.order.repository.OrderItemJpaRepository;
import com.vanmoc.inventory.repository.StockMovementJpaRepository;
import com.vanmoc.product.client.S3ProductImageClient;
import com.vanmoc.shared.exception.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.*;
import java.util.*;
@Service
public class AdminProductService {
    private final ProductJpaRepository products;
    private final CategoryJpaRepository categories;
    private final ProductEngravingFontJpaRepository fonts;
    private final EngravingFontJpaRepository fontCatalog;
    private final ProductEngravingPositionJpaRepository positions;
    private final ProductImageJpaRepository images;
    private final UserService users;
    private final CartItemJpaRepository cartItems;
    private final OrderItemJpaRepository orderItems;
    private final StockMovementJpaRepository stockMovements;
    private final S3ProductImageClient storage;
    public AdminProductService(ProductJpaRepository products,CategoryJpaRepository categories,
            ProductEngravingFontJpaRepository fonts,ProductEngravingPositionJpaRepository positions,ProductImageJpaRepository images,UserService users,
            CartItemJpaRepository cartItems, OrderItemJpaRepository orderItems, StockMovementJpaRepository stockMovements,
            S3ProductImageClient storage, EngravingFontJpaRepository fontCatalog) {
        this.products=products;this.categories=categories;this.fonts=fonts;this.positions=positions;this.images=images;this.users=users;
        this.cartItems=cartItems;this.orderItems=orderItems;this.stockMovements=stockMovements;this.storage=storage;this.fontCatalog=fontCatalog;
    }
    public void requireAdmin(UUID id) {
        if(users.me(id).role()!=UserRole.ADMIN)throw new org.springframework.security.access.AccessDeniedException("Admin required");
    }
    @Transactional(readOnly=true)
    public Page<AdminProductResponse> list(UUID user,String search,UUID category,Boolean active,boolean empty,int page) {
        requireAdmin(user);
        return products.findAdmin(search.trim().toLowerCase(Locale.ROOT),category,active,empty,
                PageRequest.of(Math.max(0,page),20,Sort.by("name","id"))).map(this::map);
    }
    @Transactional(readOnly=true)
    public AdminProductResponse get(UUID user,UUID id){requireAdmin(user);return map(products.findById(id).orElseThrow(()->new ResourceNotFoundException("PRODUCT_NOT_FOUND")));}
    @Transactional
    public AdminProductResponse save(UUID user,UUID id,AdminProductRequest r) {
        requireAdmin(user);
        if(new HashSet<>(r.fonts()).size()!=r.fonts().size()||r.positions().stream().map(AdminProductRequest.Position::position).distinct().count()!=r.positions().size()
                 ||r.engravingEnabled()&&(r.fonts().isEmpty()||r.positions().isEmpty()||r.engravingMaxChars()==null))
            throw new RuleException("INVALID_ENGRAVING",HttpStatus.BAD_REQUEST);
        var previousFonts = id == null ? Set.<String>of() : fonts.findByProductIdOrderByDisplayOrderAscIdAsc(id).stream()
                .map(ProductEngravingFontEntity::getFont).collect(java.util.stream.Collectors.toSet());
        if (r.fonts().stream().anyMatch(code -> !fontCatalog.existsByCodeAndActiveTrue(code) && !previousFonts.contains(code)))
            throw new RuleException("INVALID_ENGRAVING", HttpStatus.BAD_REQUEST);
        var p=id==null?new ProductEntity():products.lockById(id).orElseThrow(()->new ResourceNotFoundException("PRODUCT_NOT_FOUND"));
        if(id!=null&&p.getVersion()!=r.version())throw new RuleException("PRODUCT_CHANGED",HttpStatus.CONFLICT);
        p.setCategory(categories.findById(r.categoryId()).filter(CategoryEntity::isActive)
                .orElseThrow(()->new ResourceNotFoundException("CATEGORY_NOT_FOUND")));
        p.setCode(r.code().trim());p.setSlug(r.slug());p.setName(r.name().trim());p.setMaterial(r.material().trim());
        p.setDescription(r.description());p.setShortDescription(r.shortDescription());p.setPrice(r.price());p.setActive(r.active());
        p.setEngravingEnabled(r.engravingEnabled());p.setEngravingMaxChars(r.engravingMaxChars());p.setEngravingFee(r.engravingFee());
        try{products.saveAndFlush(p);}catch(org.springframework.dao.DataIntegrityViolationException exception){throw new RuleException("PRODUCT_CODE_OR_SLUG_EXISTS",HttpStatus.CONFLICT);}
        fonts.deleteAll(fonts.findByProductIdOrderByDisplayOrderAscIdAsc(p.getId()));
        positions.deleteAll(positions.findByProductIdOrderByDisplayOrderAscIdAsc(p.getId()));
        fonts.flush();positions.flush();
        for(int i=0;i<r.fonts().size();i++){var f=new ProductEngravingFontEntity();f.setProduct(p);f.setFont(r.fonts().get(i));f.setDisplayOrder(i);fonts.save(f);}
        for(int i=0;i<r.positions().size();i++){var v=r.positions().get(i);var pos=new ProductEngravingPositionEntity();pos.setProduct(p);pos.setPosition(v.position());pos.setMaxChars(v.maxChars());pos.setDisplayOrder(i);positions.save(pos);}
        return map(p);
    }
    private AdminProductResponse map(ProductEntity p){return new AdminProductResponse(p.getId(),p.getStock(),new AdminProductRequest(p.getCategory().getId(),p.getCode(),p.getSlug(),p.getName(),p.getShortDescription(),p.getDescription(),p.getMaterial(),p.getPrice(),p.isActive(),p.isEngravingEnabled(),p.getEngravingMaxChars(),p.getEngravingFee(),fonts.findByProductIdOrderByDisplayOrderAscIdAsc(p.getId()).stream().map(ProductEngravingFontEntity::getFont).toList(),positions.findByProductIdOrderByDisplayOrderAscIdAsc(p.getId()).stream().map(v->new AdminProductRequest.Position(v.getPosition(),v.getMaxChars())).toList(),p.getVersion()),images.findByProductIdOrderByDisplayOrderAscIdAsc(p.getId()).stream().map(ProductMapper::toImageResponse).toList());}
    @Transactional
    public void delete(UUID user, UUID id, long version) {
        requireAdmin(user);
        var product = products.lockById(id).orElseThrow(() -> new ResourceNotFoundException("PRODUCT_NOT_FOUND"));
        if (product.getVersion() != version) throw new RuleException("PRODUCT_CHANGED", HttpStatus.CONFLICT);
        if (product.getStock() != 0 || orderItems.existsByProductId(id) || stockMovements.existsByProductId(id))
            throw new RuleException("PRODUCT_DELETE_HAS_HISTORY", HttpStatus.CONFLICT);
        if (cartItems.existsByProductId(id))
            throw new RuleException("PRODUCT_DELETE_IN_CART", HttpStatus.CONFLICT);
        var productImages = images.findByProductIdOrderByDisplayOrderAscIdAsc(id);
        var keys = productImages.stream().map(ProductImageEntity::getStorageKey).filter(key -> key != null && !key.isBlank()).toList();
        images.deleteAll(productImages);
        fonts.deleteAll(fonts.findByProductIdOrderByDisplayOrderAscIdAsc(id));
        positions.deleteAll(positions.findByProductIdOrderByDisplayOrderAscIdAsc(id));
        products.delete(product);
        // Never delete an S3 object before the database transaction commits.
        org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                new org.springframework.transaction.support.TransactionSynchronization() {
                    @Override public void afterCommit() { storage.delete(keys); }
                });
    }
}
