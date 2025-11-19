package com.coffeeshop.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.security.web.firewall.StrictHttpFirewall;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Value("${ALLOWED_ORIGINS:http://localhost:3000}")
    private String allowedOriginsProp;

    @PostConstruct
    public void init() {
        System.out.println(">>> ALLOWED_ORIGINS = " + allowedOriginsProp);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(c -> c.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())

                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Public routes
                        .requestMatchers("/", "/ping", "/error", "/actuator/**").permitAll()
                        .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/refresh").permitAll()

                        // Public GET (menus, products, tables)
                        .requestMatchers(HttpMethod.GET, "/api/menus/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/tables/available").permitAll()

                        // ADMIN operations (write)
                        .requestMatchers(HttpMethod.POST, "/api/menus/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/menus/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/menus/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")

                        // Authenticated routes
                        .requestMatchers("/api/auth/me").hasAnyRole("ADMIN","CUSTOMER")
                        .requestMatchers("/api/orders","/api/orders/**",
                                "/api/reservations","/api/reservations/**")
                        .hasAnyRole("CUSTOMER","ADMIN")

                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }

    // ===== CORS =====
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        List<String> origins = Arrays.stream(allowedOriginsProp.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(origins);
        cfg.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        cfg.setAllowedHeaders(Arrays.asList("Authorization","Content-Type","Origin","Accept"));
        cfg.setExposedHeaders(Arrays.asList("Authorization","Content-Type"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }

    @Bean
    public HttpFirewall httpFirewall() {
        StrictHttpFirewall fw = new StrictHttpFirewall();
        fw.setAllowSemicolon(true);
        return fw;
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer(HttpFirewall firewall) {
        return web -> web.httpFirewall(firewall);
    }
}
