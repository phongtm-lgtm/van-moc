package com.vanmoc.inventory.dto.response;
import java.util.UUID;
import java.time.Instant;
import com.vanmoc.inventory.enums.StockMovementReason;
public record StockMovementResponse(UUID id,int delta,StockMovementReason reason,String note,UUID orderId,UUID changedByUserId,Instant createdAt) {}
