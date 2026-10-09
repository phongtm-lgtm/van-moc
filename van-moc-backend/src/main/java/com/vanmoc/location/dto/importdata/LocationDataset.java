package com.vanmoc.location.dto.importdata;

import java.util.List;

public record LocationDataset(List<ProvinceData> provinces, List<WardData> wards) {
    public LocationDataset {
        provinces = List.copyOf(provinces);
        wards = List.copyOf(wards);
    }
}
