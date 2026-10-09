package com.vanmoc.location.repository;

import com.vanmoc.location.dto.importdata.LocationDataset;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class LocationImportRepository {
    private final JdbcTemplate jdbc;
    public LocationImportRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public boolean hasProvincesAndWards() {
        return Boolean.TRUE.equals(jdbc.queryForObject("""
                SELECT EXISTS (SELECT 1 FROM provinces) AND EXISTS (SELECT 1 FROM wards)
                """, Boolean.class));
    }

    @Transactional
    public void importDataset(LocationDataset dataset) {
        jdbc.batchUpdate("""
                INSERT INTO provinces (code, name, division_type, codename)
                VALUES (?, ?, ?, ?)
                ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name,
                    division_type = EXCLUDED.division_type, codename = EXCLUDED.codename
                """, dataset.provinces(), 100, (statement, province) -> {
            statement.setInt(1, province.code());
            statement.setString(2, province.name());
            statement.setString(3, province.divisionType());
            statement.setString(4, province.codename());
        });
        jdbc.batchUpdate("""
                INSERT INTO wards (code, name, division_type, codename, province_code)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name,
                    division_type = EXCLUDED.division_type, codename = EXCLUDED.codename,
                    province_code = EXCLUDED.province_code
                """, dataset.wards(), 500, (statement, ward) -> {
            statement.setInt(1, ward.code());
            statement.setString(2, ward.name());
            statement.setString(3, ward.divisionType());
            statement.setString(4, ward.codename());
            statement.setInt(5, ward.provinceCode());
        });
    }
}
