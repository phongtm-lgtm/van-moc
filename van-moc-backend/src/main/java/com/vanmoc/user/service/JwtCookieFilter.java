package com.vanmoc.user.service;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtCookieFilter extends OncePerRequestFilter {
    private final JwtService jwt;
    public JwtCookieFilter(JwtService jwt) { this.jwt = jwt; }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        var admin = request.getRequestURI().startsWith("/api/admin/")
                && !request.getRequestURI().equals("/api/admin/login");
        if (request.getCookies() != null) {
            for (var cookie : request.getCookies()) {
                if (!(admin ? "VM_ADMIN" : "VM_ACCESS").equals(cookie.getName())) continue;
                var auth = admin ? jwt.authenticateAdmin(cookie.getValue()) : jwt.authenticate(cookie.getValue());
                if (auth != null) SecurityContextHolder.getContext().setAuthentication(auth);
                break;
            }
        }
        chain.doFilter(request, response);
    }
}
