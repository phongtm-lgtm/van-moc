package com.vanmoc.order.enums;

public enum OrderStatus {
    PENDING_PAYMENT,
    PENDING_CONFIRMATION,
    CONFIRMED,
    PROCESSING,
    READY_TO_SHIP,
    SHIPPING,
    COMPLETED,
    CANCELLED
}
