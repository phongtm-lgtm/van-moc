package com.vanmoc.order.dto.request;
import com.vanmoc.order.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
public record OrderTransitionRequest(@NotNull OrderStatus status, boolean collectCod) {}
