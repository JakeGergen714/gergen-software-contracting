package com.gergen.portal.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Test profile security configuration used in Docker-based E2E runs.
 *
 * - Permits /api/test/** so Playwright can seed/reset data without a token.
 * - Keeps normal JWT-based auth for all other endpoints.
 */
@Configuration
@Profile("test")
@ConditionalOnProperty(name = "app.security.disable", havingValue = "false", matchIfMissing = true)
@EnableMethodSecurity
public class TestSecurityConfig {

    private final JwtAuthenticationConverter jwtAuthConverter;

    public TestSecurityConfig(SecurityConfig baseConfig) {
        this.jwtAuthConverter = baseConfigJwtConverter(baseConfig);
    }

    private JwtAuthenticationConverter baseConfigJwtConverter(SecurityConfig baseConfig) {
        // Reuse SecurityConfig.jwtAuthConverter via a small helper since it is private.
        // If needed, expose it as a package-private method instead.
        try {
            var method = SecurityConfig.class.getDeclaredMethod("jwtAuthConverter");
            method.setAccessible(true);
            return (JwtAuthenticationConverter) method.invoke(baseConfig);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to obtain JwtAuthenticationConverter from SecurityConfig", ex);
        }
    }

    @Bean
    public SecurityFilterChain testSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/test/**").permitAll()
                .anyRequest().authenticated()
            )
            .cors(Customizer.withDefaults())
            .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthConverter)));

        return http.build();
    }
}
