package com.vanmoc.user.mapper;

import com.vanmoc.user.dto.response.MeResponse;
import com.vanmoc.user.entity.UserEntity;

public final class UserMapper {
    private UserMapper() {}
    public static MeResponse toResponse(UserEntity user) {
        return new MeResponse(user.getId(), user.getEmail(), user.getFullName(), user.getAvatarUrl(), user.getRole());
    }
}
