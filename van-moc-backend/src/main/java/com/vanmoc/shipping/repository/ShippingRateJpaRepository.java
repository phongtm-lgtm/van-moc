package com.vanmoc.shipping.repository;
import com.vanmoc.shipping.entity.ShippingRateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ShippingRateJpaRepository extends JpaRepository<ShippingRateEntity, Integer> {}
