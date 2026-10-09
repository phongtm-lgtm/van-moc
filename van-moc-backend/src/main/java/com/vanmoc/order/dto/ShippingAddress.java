package com.vanmoc.order.dto;

/** Historical snapshot; independent of saved addresses and current location names. */
public record ShippingAddress(String recipientName, String recipientPhone,
                              Integer provinceCode, String provinceName,
                              Integer wardCode, String wardName, String addressLine) {
}
