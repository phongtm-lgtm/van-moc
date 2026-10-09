package com.vanmoc.location.repository;

import com.vanmoc.location.entity.WardEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WardJpaRepository extends JpaRepository<WardEntity, Integer> {
    List<WardEntity> findByProvinceCodeOrderByNameAsc(Integer provinceCode);
}
