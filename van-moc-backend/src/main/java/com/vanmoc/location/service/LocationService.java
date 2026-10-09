package com.vanmoc.location.service;

import com.vanmoc.location.dto.response.ProvinceResponse;
import com.vanmoc.location.dto.response.WardResponse;
import com.vanmoc.location.mapper.LocationMapper;
import com.vanmoc.location.repository.ProvinceJpaRepository;
import com.vanmoc.location.repository.WardJpaRepository;
import com.vanmoc.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class LocationService {
    private final ProvinceJpaRepository provinces;
    private final WardJpaRepository wards;
    public LocationService(ProvinceJpaRepository provinces, WardJpaRepository wards) {
        this.provinces = provinces;
        this.wards = wards;
    }
    public List<ProvinceResponse> getProvinces() {
        return provinces.findAllByOrderByNameAsc().stream().map(LocationMapper::toResponse).toList();
    }
    public List<WardResponse> getWards(Integer provinceCode) {
        if (!provinces.existsById(provinceCode)) throw new ResourceNotFoundException("PROVINCE_NOT_FOUND");
        return wards.findByProvinceCodeOrderByNameAsc(provinceCode).stream().map(LocationMapper::toResponse).toList();
    }
}
