package com.vanmoc.shared.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.List;
import com.vanmoc.user.service.GoogleOidcUserService;
import com.vanmoc.user.service.JwtCookieFilter;
import com.vanmoc.user.service.JwtService;
import com.vanmoc.user.service.AdminIdentity;
import com.vanmoc.user.service.JwtIdentity;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.core.Authentication;
import java.util.function.Supplier;
import org.springframework.boot.web.servlet.FilterRegistrationBean;

@Configuration
public class SecurityConfig {
    @Bean
    FilterRegistrationBean<JwtCookieFilter> jwtFilterRegistration(JwtCookieFilter filter) {
        var registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }
    @Bean
    org.springframework.security.crypto.password.PasswordEncoder passwordEncoder() {
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    }
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, GoogleOidcUserService google,
            JwtCookieFilter jwtFilter, JwtService jwt,
            @Value("${server.servlet.session.cookie.secure}") boolean secure,
            @Value("${server.servlet.session.cookie.same-site}") String sameSite,
            @Value("${app.cors.allowed-origin}") String frontend) throws Exception {
        return http.cors(cors -> {}).csrf(csrf -> csrf.ignoringRequestMatchers("/api/payments/sepay/webhook"))
                // API clients handle 401 themselves; saving a request in JDBC sessions is unnecessary
                // and can race when several unauthenticated requests share the same session.
                .requestCache(cache -> cache.disable())
                .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.POST, "/api/payments/sepay/webhook").permitAll()
                .requestMatchers("/api/admin/login").permitAll()
                .requestMatchers("/api/admin/me").authenticated()
                .requestMatchers("/api/admin/categories", "/api/admin/categories/*").authenticated()
                .requestMatchers("/api/admin/engraving-fonts", "/api/admin/engraving-fonts/*").authenticated()
                .requestMatchers("/api/admin/products", "/api/admin/products/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/admin/orders", "/api/admin/orders/*").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/orders/*/payment").access((authentication, context) -> customer(authentication))
                .requestMatchers(HttpMethod.GET, "/api/orders", "/api/orders/*").access((authentication, context) -> customer(authentication))
                .requestMatchers("/api/checkout", "/api/checkout/preview").access((authentication, context) -> customer(authentication))
                .requestMatchers("/api/orders/*/cancel").access((authentication, context) -> customer(authentication))
                .requestMatchers("/api/admin/orders/*/status").authenticated()
                .requestMatchers("/api/admin/shipping", "/api/admin/shipping/*").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/engraving-fonts", "/api/categories", "/api/products", "/api/products/*", "/api/products/by-slug/*",
                        "/api/provinces", "/api/provinces/*/wards").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/auth/csrf").permitAll()
                .requestMatchers("/oauth2/**", "/login/**", "/error").permitAll()
                .requestMatchers("/api/me", "/api/addresses", "/api/addresses/*", "/api/cart", "/api/cart/**")
                    .access((authentication, context) -> customer(authentication))
                .anyRequest().denyAll())
                .formLogin(login -> login.loginProcessingUrl("/api/admin/login")
                         .successHandler((request, response, authentication) -> {
                             var token = jwt.issueAdmin(AdminIdentity.id(authentication));
                             response.addHeader("Set-Cookie", ResponseCookie.from("VM_ADMIN", token)
                                     .httpOnly(true).secure(secure).sameSite(sameSite).path("/")
                                     .maxAge(jwt.ttlSeconds()).build().toString());
                             request.getSession().invalidate();
                             response.setStatus(204);
                         })
                        .failureHandler((request, response, exception) -> problem(response, 401, "INVALID_ADMIN_CREDENTIALS")))
                .oauth2Login(login -> login.userInfoEndpoint(info -> info.oidcUserService(google))
                        .successHandler((request, response, authentication) -> {
                            var token = jwt.issue(AdminIdentity.id(authentication));
                            response.addHeader("Set-Cookie", ResponseCookie.from("VM_ACCESS", token)
                                    .httpOnly(true).secure(secure).sameSite(sameSite).path("/")
                                    .maxAge(jwt.ttlSeconds()).build().toString());
                            request.getSession().invalidate();
                            response.sendRedirect(frontend + "/shop");
                        })
                        .failureHandler((request, response, exception) -> response.sendRedirect(frontend + "/login?error=authentication_failed")))
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint((request, response, exception) -> problem(response, 401, "AUTHENTICATION_REQUIRED"))
                        .accessDeniedHandler((request, response, exception) -> problem(response, 403, "ACCESS_DENIED")))
                .logout(logout -> logout.logoutUrl("/api/auth/logout").invalidateHttpSession(true).deleteCookies("JSESSIONID")
                        .logoutSuccessHandler((request, response, authentication) -> {
                             response.addHeader("Set-Cookie", ResponseCookie.from("VM_ACCESS", "")
                                     .httpOnly(true).secure(secure).sameSite(sameSite).path("/").maxAge(0).build().toString());
                             response.addHeader("Set-Cookie", ResponseCookie.from("VM_ADMIN", "")
                                     .httpOnly(true).secure(secure).sameSite(sameSite).path("/").maxAge(0).build().toString());
                            response.setStatus(204);
                        }))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origin}") String origin,
            @Value("${app.cors.admin-origin:http://localhost:5174}") String adminOrigin,
            @Value("${app.cors.admin-vercel-origin:}") String adminVercelOrigin) {
        var config = new CorsConfiguration();
        var allowedOrigins = new java.util.ArrayList<>(List.of(origin, adminOrigin));
        if (!adminVercelOrigin.isBlank()) allowedOrigins.add(adminVercelOrigin);
        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PATCH", "DELETE"));
        config.setAllowedHeaders(List.of("Accept", "Accept-Language", "Content-Type", "X-CSRF-TOKEN"));
        config.setAllowCredentials(true);
        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }

    private static void problem(HttpServletResponse response, int status, String code) throws java.io.IOException {
        response.setStatus(status);
        response.setContentType("application/problem+json");
        response.getWriter().write("{\"status\":" + status + ",\"code\":\"" + code + "\",\"title\":\"" + code + "\"}");
    }
    private static AuthorizationDecision customer(Supplier<? extends Authentication> auth) {
        return new AuthorizationDecision(auth.get() != null && auth.get().getPrincipal() instanceof JwtIdentity);
    }
}
