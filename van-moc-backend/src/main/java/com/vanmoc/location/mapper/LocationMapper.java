package com.vanmoc.location.mapper;

import com.vanmoc.location.dto.response.ProvinceResponse;
import com.vanmoc.location.dto.response.WardResponse;
import com.vanmoc.location.entity.ProvinceEntity;
import com.vanmoc.location.entity.WardEntity;

public final class LocationMapper {
    private LocationMapper() {}
    public static ProvinceResponse toResponse(ProvinceEntity province) {
        return new ProvinceResponse(province.getCode(), province.getName(), province.getDivisionType(), province.getCodename());
    }
    public static WardResponse toResponse(WardEntity ward) {
        return new WardResponse(ward.getCode(), ward.getProvince().getCode(), ward.getName(),
                ward.getDivisionType(), ward.getCodename());
    }
}
