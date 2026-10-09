package com.vanmoc.user.repository;

import com.vanmoc.user.entity.AddressEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AddressJpaRepository extends JpaRepository<AddressEntity, UUID> {
    @EntityGraph(attributePaths = {"ward", "ward.province"})
    List<AddressEntity> findByUserIdOrderByCreatedAtAscIdAsc(UUID userId);
    @EntityGraph(attributePaths = {"ward", "ward.province"})
    Optional<AddressEntity> findByIdAndUserId(UUID id, UUID userId);
}
