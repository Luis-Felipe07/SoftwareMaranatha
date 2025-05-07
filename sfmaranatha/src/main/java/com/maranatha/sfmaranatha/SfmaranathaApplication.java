package com.maranatha.sfmaranatha;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class SfmaranathaApplication {

    public static void main(String[] args) {
        SpringApplication.run(SfmaranathaApplication.class, args);
    }

    // Defino el bean para que Spring pueda inyectar BCryptPasswordEncoder
    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
