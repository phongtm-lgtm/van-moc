package com.vanmoc.location.service;

import com.vanmoc.location.dto.importdata.LocationDataset;
import com.vanmoc.location.client.OpenApiLocationClient;
import com.vanmoc.location.repository.LocationImportRepository;
import org.springframework.stereotype.Service;
import java.util.HashSet;
import java.util.Objects;

@Service
public class LocationInitializationService {
    public enum Mode { DISABLED, IF_EMPTY, REFRESH }
    public record Result(boolean imported, int provinceCount, int wardCount) {}

    private final OpenApiLocationClient source;
    private final LocationImportRepository importer;

    public LocationInitializationService(OpenApiLocationClient source, LocationImportRepository importer) {
        this.source = source;
        this.importer = importer;
    }

    public Result execute(Mode mode) {
        Objects.requireNonNull(mode, "Location init mode is required");
        if (mode == Mode.DISABLED || (mode == Mode.IF_EMPTY && importer.hasProvincesAndWards())) {
            return new Result(false, 0, 0);
        }
        // No database transaction is held while the external API is being called.
        var dataset = source.fetch();
        validate(dataset);
        importer.importDataset(dataset);
        return new Result(true, dataset.provinces().size(), dataset.wards().size());
    }

    private void validate(LocationDataset dataset) {
        if (dataset == null || dataset.provinces().isEmpty() || dataset.wards().isEmpty()) {
            throw new IllegalStateException("Location API returned an empty dataset");
        }
        var provinceCodes = new HashSet<Integer>();
        var provinceCodenames = new HashSet<String>();
        for (var province : dataset.provinces()) {
            if (province.code() == null || province.code() <= 0 || !provinceCodes.add(province.code())
                    || blank(province.name()) || blank(province.divisionType()) || blank(province.codename())
                    || !provinceCodenames.add(province.codename())) {
                throw new IllegalStateException("Invalid or duplicate province in location dataset");
            }
        }
        var wardCodes = new HashSet<Integer>();
        for (var ward : dataset.wards()) {
            if (ward.code() == null || ward.code() <= 0 || !wardCodes.add(ward.code())
                    || !provinceCodes.contains(ward.provinceCode()) || blank(ward.name())
                    || blank(ward.divisionType()) || blank(ward.codename())) {
                throw new IllegalStateException("Invalid, duplicate or orphan ward in location dataset");
            }
        }
    }

    private boolean blank(String value) { return value == null || value.isBlank(); }
}
