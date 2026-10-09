package com.vanmoc.order.dto.response;

public record AdminOrderStatsResponse(long total, long pendingConfirmation, long cancelled) {}
