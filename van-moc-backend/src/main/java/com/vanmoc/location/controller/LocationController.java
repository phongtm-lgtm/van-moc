package com.vanmoc.location.controller;

import com.vanmoc.location.service.LocationService;
import com.vanmoc.location.dto.response.ProvinceResponse;
import com.vanmoc.location.dto.response.WardResponse;
import jakarta.validation.constraints.Positive;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/provinces")
public class LocationController {
    private final LocationService service;
    public LocationController(LocationService service) { this.service = service; }

    @GetMapping
    public List<ProvinceResponse> provinces() { return service.getProvinces(); }

    @GetMapping("/{provinceCode}/wards")
    public List<WardResponse> wards(@PathVariable @Positive Integer provinceCode) {
        return service.getWards(provinceCode);
    }
}
