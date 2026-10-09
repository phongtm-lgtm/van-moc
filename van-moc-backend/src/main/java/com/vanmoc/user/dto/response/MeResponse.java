package com.vanmoc.user.dto.response;

import com.vanmoc.user.enums.UserRole;
import java.util.UUID;

public record MeResponse(UUID id, String email, String fullName, String avatarUrl, UserRole role) {}
