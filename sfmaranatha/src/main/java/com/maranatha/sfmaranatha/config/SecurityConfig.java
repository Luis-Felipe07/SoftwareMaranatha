package com.maranatha.sfmaranatha.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/CSS/**", "/IMG/**", "/JS/**",
                                 "/**.html",  
                                 "/api/usuarios/**",   
                                 "/api/pedidos/**"       
                ).permitAll()
                .anyRequest().permitAll()
            )
            // Deshabilito el formulario de login y autenticación básica
            .formLogin().disable()
            .httpBasic().disable()
            // Deshabilito CSRF para facilitar el desarrollo 
            .csrf().disable();

        return http.build();
    }
}
