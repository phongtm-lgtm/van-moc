package com.vanmoc.user.mapper;

import com.vanmoc.user.entity.AddressEntity;
import com.vanmoc.user.dto.response.AddressResponse;

public final class AddressMapper {
    private AddressMapper() {}
    public static AddressResponse toResponse(AddressEntity address) {
        var ward = address.getWard();
        var province = ward.getProvince();
        return new AddressResponse(address.getId(), address.getLabel(), address.getRecipientName(), address.getPhone(),
                ward.getCode(), ward.getName(), province.getCode(), province.getName(), address.getAddressLine(), address.isDefaultAddress());
    }
}
