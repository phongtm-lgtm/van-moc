package com.vanmoc.user.dto.request;

import jakarta.validation.constraints.*;

public record AddressRequest(@Size(max = 255) String label,
        @NotBlank @Size(max = 255) String recipientName,
        @NotBlank @Pattern(regexp = "[+0-9 ()-]{8,20}") String phone,
        @NotNull @Positive Integer wardCode,
        @NotBlank @Size(max = 2000) String addressLine, @NotNull Boolean isDefault) {}
