package com.mockapiproject.mockapi.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

/**
 * CORS Configuration for Nginx Reverse Proxy Setup
 * 
 * IMPORTANT: With Nginx reverse proxy, all requests come from the same origin.
 * The frontend and backend appear to be on the same domain, so CORS is not
 * needed.
 * 
 * This configuration is kept for:
 * 1. Development purposes (direct backend access)
 * 2. Health checks and internal requests
 * 3. Flexibility if needed in the future
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Allow all origins (works with Nginx since requests are from same origin)
        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");

        // Register CORS configuration for all endpoints
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
