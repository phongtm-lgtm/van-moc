package com.vanmoc.user.entity;

import com.vanmoc.shared.persistence.BaseEntity;
import com.vanmoc.user.enums.UserRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(name = "uk_users_google_subject", columnNames = "google_subject"),
        @UniqueConstraint(name = "uk_users_email", columnNames = "email")
})
public class UserEntity extends BaseEntity {

    @Column(name = "google_subject", updatable = false)
    private String googleSubject;

    @Column(columnDefinition = "text")
    private String email;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "avatar_url", columnDefinition = "text")
    private String avatarUrl;

    @Enumerated(EnumType.STRING)
    private UserRole role = UserRole.CUSTOMER;

    private boolean active = true;

    private String username;
    @Column(name = "password_hash", columnDefinition = "text")
    private String passwordHash;
}
