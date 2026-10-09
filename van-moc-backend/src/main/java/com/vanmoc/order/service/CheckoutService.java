package com.vanmoc.order.service;

import com.vanmoc.order.dto.request.CheckoutRequest;
import com.vanmoc.order.dto.response.CheckoutResponse;
import com.vanmoc.order.entity.*;
import com.vanmoc.order.enums.*;
import com.vanmoc.order.repository.*;
import com.vanmoc.cart.repository.*;
import com.vanmoc.cart.mapper.CartMapper;
import com.vanmoc.product.repository.*;
import com.vanmoc.product.service.EngravingService;
import com.vanmoc.user.repository.*;
import com.vanmoc.payment.entity.PaymentEntity;
import com.vanmoc.payment.enums.*;
import com.vanmoc.payment.repository.PaymentJpaRepository;
import com.vanmoc.payment.config.SePayConfig;
import com.vanmoc.inventory.entity.StockMovementEntity;
import com.vanmoc.inventory.enums.StockMovementReason;
import com.vanmoc.inventory.repository.StockMovementJpaRepository;
import com.vanmoc.shared.exception.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;

@Service
public class CheckoutService {
    private final UserJpaRepository users;
    private final AddressJpaRepository addresses;
    private final CartJpaRepository carts;
    private final CartItemJpaRepository cartItems;
    private final ProductJpaRepository products;
    private final ProductImageJpaRepository images;
    private final EngravingService engraving;
    private final PaymentOrderRepository orders;
    private final OrderItemJpaRepository items;
    private final PaymentJpaRepository payments;
    private final OrderHistoryJpaRepository history;
    private final StockMovementJpaRepository stock;
    private final SePayConfig sepay;
    private final com.vanmoc.shipping.service.ShippingService shippingRates;
    private final Duration timeout;
    public CheckoutService(UserJpaRepository users, AddressJpaRepository addresses, CartJpaRepository carts,
            CartItemJpaRepository cartItems, ProductJpaRepository products, ProductImageJpaRepository images,
            EngravingService engraving, PaymentOrderRepository orders, OrderItemJpaRepository items,
            PaymentJpaRepository payments, OrderHistoryJpaRepository history, StockMovementJpaRepository stock,
            SePayConfig sepay, com.vanmoc.shipping.service.ShippingService shippingRates,
            @Value("${app.checkout.payment-timeout-minutes}") long minutes) {
        this.users=users; this.addresses=addresses; this.carts=carts; this.cartItems=cartItems; this.products=products;
        this.images=images; this.engraving=engraving; this.orders=orders; this.items=items; this.payments=payments;
        this.history=history; this.stock=stock; this.sepay=sepay; this.shippingRates=shippingRates; this.timeout=Duration.ofMinutes(minutes);
        if (minutes<=0) throw new IllegalArgumentException("Invalid checkout configuration");
    }
    @Transactional
    public CheckoutResponse checkout(UUID userId, CheckoutRequest request, boolean create) {
        var user=users.lockById(userId).filter(u->u.isActive()).orElseThrow(()->new org.springframework.security.access.AccessDeniedException("Account unavailable"));
        var ids=request.cartItemIds().stream().sorted().toList();
        if (new HashSet<>(ids).size()!=ids.size()) throw new RuleException("DUPLICATE_CART_ITEM", HttpStatus.BAD_REQUEST);
        String hash;
        try { hash=java.util.HexFormat.of().formatHex(java.security.MessageDigest.getInstance("SHA-256")
                .digest((ids+"|"+request.addressId()+"|"+request.paymentMethod()+"|"+Objects.toString(request.note(), "")).getBytes(java.nio.charset.StandardCharsets.UTF_8))); }
        catch (java.security.NoSuchAlgorithmException exception) { throw new IllegalStateException(exception); }
        var existing=orders.findByUserIdAndIdempotencyKey(userId, request.idempotencyKey());
        if (existing.isPresent()) {
            if (!hash.equals(existing.get().getRequestHash())) throw new RuleException("IDEMPOTENCY_CONFLICT", HttpStatus.CONFLICT);
            return response(existing.get());
        }
        if (request.paymentMethod()==PaymentMethod.BANK_TRANSFER) sepay.requireConfigured();
        var address=addresses.findByIdAndUserId(request.addressId(),userId).orElseThrow(()->new ResourceNotFoundException("ADDRESS_NOT_FOUND"));
        var cart=carts.findByUserId(userId).orElseThrow(()->new ResourceNotFoundException("CART_NOT_FOUND"));
        var rows=cartItems.findCheckoutItems(cart.getId()).stream().filter(i->ids.contains(i.getId())).toList();
        if (rows.size()!=ids.size() || rows.isEmpty()) throw new ResourceNotFoundException("CART_ITEM_NOT_FOUND");
        var locked=new HashMap<UUID,com.vanmoc.product.entity.ProductEntity>();
        var quantities=new HashMap<UUID,Integer>();
        for (var row:rows) quantities.merge(row.getProduct().getId(),row.getQuantity(),Math::addExact);
        for (var id:quantities.keySet().stream().sorted().toList()) {
            var p=products.lockById(id).orElseThrow(()->new ResourceNotFoundException("PRODUCT_NOT_FOUND"));
            if (!p.isActive() || !p.getCategory().isActive()) throw new ResourceNotFoundException("PRODUCT_NOT_FOUND");
            if (quantities.get(id)<1 || quantities.get(id)>p.getStock()) throw new RuleException("INSUFFICIENT_STOCK",HttpStatus.CONFLICT);
            locked.put(id,p);
        }
        var urls=new HashMap<UUID,String>();
        for (var image:images.findListImages(locked.keySet().stream().toList())) urls.putIfAbsent(image.getProductId(),image.getImageUrl());
        var order=new OrderEntity(); order.setUser(user); order.setPaymentMethod(request.paymentMethod());
        order.setStatus(request.paymentMethod()==PaymentMethod.COD?OrderStatus.PENDING_CONFIRMATION:OrderStatus.PENDING_PAYMENT);
        order.setOrderCode("VM"+UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase(Locale.ROOT));
        order.setIdempotencyKey(request.idempotencyKey()); order.setRequestHash(hash); order.setCustomerNote(request.note());
        order.setRecipientName(address.getRecipientName()); order.setRecipientPhone(address.getPhone()); order.setShippingAddressLine(address.getAddressLine());
        order.setShippingWardCode(address.getWard().getCode()); order.setShippingWardName(address.getWard().getName());
        order.setShippingProvinceCode(address.getWard().getProvince().getCode()); order.setShippingProvinceName(address.getWard().getProvince().getName());
        BigDecimal subtotal=BigDecimal.ZERO,fees=BigDecimal.ZERO;
        var snapshots=new ArrayList<OrderItemEntity>();
        for (var row:rows) {
            var p=locked.get(row.getProduct().getId()); var config=engraving.validate(p,CartMapper.engraving(row));
            var fee=config==null?BigDecimal.ZERO:p.getEngravingFee();
            subtotal=subtotal.add(p.getPrice().multiply(BigDecimal.valueOf(row.getQuantity()))); fees=fees.add(fee.multiply(BigDecimal.valueOf(row.getQuantity())));
            var item=new OrderItemEntity(); item.setOrder(order); item.setProduct(p); item.setProductCode(p.getCode()); item.setProductName(p.getName());
            item.setProductImageUrl(urls.get(p.getId())); item.setQuantity(row.getQuantity()); item.setUnitPrice(p.getPrice()); item.setEngravingUnitFee(fee);
            item.setLineTotal(p.getPrice().add(fee).multiply(BigDecimal.valueOf(row.getQuantity())));
            if(config!=null){item.setEngravingText(config.text());item.setEngravingFont(config.font());item.setEngravingPosition(config.position());} snapshots.add(item);
        }
        var shipping = shippingRates.feeFor(address.getWard().getProvince().getCode());
        order.setProductSubtotal(subtotal); order.setEngravingTotal(fees); order.setShippingFee(shipping); order.setGrandTotal(subtotal.add(fees).add(shipping));
        order.getGrandTotal().toBigIntegerExact();
        if(!create) return response(order);
        if(request.paymentMethod()==PaymentMethod.BANK_TRANSFER) order.setPaymentExpiresAt(Instant.now().plus(timeout));
        orders.saveAndFlush(order); items.saveAll(snapshots);
        for(var p:locked.values()) {
            int quantity=quantities.get(p.getId()); p.setStock(p.getStock()-quantity);
            var movement=new StockMovementEntity(); movement.setProduct(p);movement.setOrder(order);movement.setQuantityChange(-quantity);
            movement.setReason(StockMovementReason.ORDER_CREATED);movement.setChangedByUser(user);stock.save(movement);
        }
        var payment=new PaymentEntity();payment.setOrder(order);payment.setMethod(request.paymentMethod());payment.setStatus(PaymentStatus.PENDING);
        payment.setExpectedAmount(order.getGrandTotal());
        if(request.paymentMethod()==PaymentMethod.BANK_TRANSFER){payment.setProvider(PaymentProvider.SEPAY);payment.setTransferCode(order.getOrderCode());payment.setExpiresAt(order.getPaymentExpiresAt());}
        payments.save(payment);
        var change=new OrderStatusHistoryEntity();change.setOrder(order);change.setNewStatus(order.getStatus());change.setActorType(OrderStatusActorType.CUSTOMER);change.setChangedByUser(user);history.save(change);
        cartItems.deleteAll(rows);
        return response(order);
    }
    private CheckoutResponse response(OrderEntity o){return new CheckoutResponse(o.getId(),o.getOrderCode(),o.getStatus(),o.getProductSubtotal(),o.getEngravingTotal(),o.getShippingFee(),o.getGrandTotal());}
}
