package com.vanmoc.user.service;

import com.vanmoc.user.dto.request.AddressRequest;
import com.vanmoc.user.dto.response.AddressResponse;
import com.vanmoc.user.entity.AddressEntity;
import com.vanmoc.user.mapper.AddressMapper;
import com.vanmoc.user.repository.*;
import com.vanmoc.location.repository.WardJpaRepository;
import com.vanmoc.shared.exception.ResourceNotFoundException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
public class AddressService {
    private final UserJpaRepository users;
    private final AddressJpaRepository addresses;
    private final WardJpaRepository wards;
    private final UserService userService;
    public AddressService(UserJpaRepository users, AddressJpaRepository addresses, WardJpaRepository wards, UserService userService) {
        this.users = users; this.addresses = addresses; this.wards = wards; this.userService = userService;
    }
    @Transactional(readOnly = true)
    public List<AddressResponse> list(UUID userId) {
        userService.me(userId);
        return addresses.findByUserIdOrderByCreatedAtAscIdAsc(userId).stream().map(AddressMapper::toResponse).toList();
    }
    @Transactional
    public AddressResponse save(UUID userId, UUID id, AddressRequest request) {
        // Serializes default-address changes for the same owner, including concurrent creates.
        var user = users.lockById(userId).filter(u -> u.isActive())
                .orElseThrow(() -> new AccessDeniedException("Account unavailable"));
        var address = id == null ? new AddressEntity() : addresses.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("ADDRESS_NOT_FOUND"));
        var ward = wards.findById(request.wardCode()).filter(w -> w.getProvince() != null)
                .orElseThrow(() -> new ResourceNotFoundException("WARD_NOT_FOUND"));
        if (request.isDefault()) {
            addresses.findByUserIdOrderByCreatedAtAscIdAsc(userId).stream().filter(AddressEntity::isDefaultAddress)
                    .forEach(existing -> existing.setDefaultAddress(false));
            addresses.flush();
        }
        address.setUser(user); address.setWard(ward); address.setLabel(request.label());
        address.setRecipientName(request.recipientName().trim()); address.setPhone(request.phone().trim());
        address.setAddressLine(request.addressLine().trim()); address.setDefaultAddress(request.isDefault());
        return AddressMapper.toResponse(addresses.saveAndFlush(address));
    }
    @Transactional
    public void delete(UUID userId, UUID id) {
        users.lockById(userId).filter(u -> u.isActive()).orElseThrow(() -> new AccessDeniedException("Account unavailable"));
        addresses.delete(addresses.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("ADDRESS_NOT_FOUND")));
    }
}
