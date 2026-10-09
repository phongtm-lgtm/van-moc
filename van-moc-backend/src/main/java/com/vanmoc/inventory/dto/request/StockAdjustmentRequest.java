package com.vanmoc.inventory.dto.request;
import jakarta.validation.constraints.*;
public record StockAdjustmentRequest(@Min(-1000000) @Max(1000000) int delta,@NotBlank @Size(max=2000) String note) {}
