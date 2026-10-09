package com.vanmoc.user.dto.response;

import java.util.UUID;

public record AddressResponse(UUID id, String label, String recipientName, String phone,
        Integer wardCode, String wardName, Integer provinceCode, String provinceName,
        String addressLine, boolean isDefault) {}
