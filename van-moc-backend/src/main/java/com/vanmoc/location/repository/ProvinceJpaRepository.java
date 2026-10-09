package com.vanmoc.location.repository;

import com.vanmoc.location.entity.ProvinceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProvinceJpaRepository extends JpaRepository<ProvinceEntity, Integer> {
    List<ProvinceEntity> findAllByOrderByNameAsc();
}
