package com.maranatha.sfmaranatha.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig implements WebMvcConfigurer {
    
    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                // Recursos públicos
                .requestMatchers(
                    "/",
                    "/login",
                    "/login.html",
                    "/CSS/**", 
                    "/IMG/**", 
                    "/JS/**",
                    "/uploads/**",
                    "/api/usuarios/login",
                    "/api/usuarios/registrar",
                    "/api/usuarios/validar",
                    "/api/usuarios/recuperar",
                    "/api/usuarios/sesion-actual",
                    "/api/pedidos/actualizar-estado/**",
                    "/api/pedidos/cancelar/**",
                    "/api/pedidos",
                    "/api/mesas/**",
                    "/api/menus",
                    "/api/platos/menu/**",
                    "/api/calificaciones/estadisticas",
                    "/api/calificaciones/comentarios",
                    "/error",
                    "/*.html"
                ).permitAll()
                
                // Rutas que requieren autenticación
                .requestMatchers("/api/pedidos/**").hasAnyRole("ADMIN", "ENCARGADO", "CLIENTE")
                .requestMatchers("/api/calificaciones/**").hasAnyRole("ADMIN", "ENCARGADO", "CLIENTE")
                .requestMatchers("/api/reportes/**").hasRole("ADMIN")
                
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/")
                .permitAll()
            );

        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*")); // Para desarrollo, en producción se ponen dominios
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(false); // Cambiado a false porque uso "*" en origins
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Configurar directorio de uploads
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/");
        
        // Configurar recursos estáticos
        registry.addResourceHandler("/CSS/**")
                .addResourceLocations("classpath:/static/CSS/");
        
        registry.addResourceHandler("/JS/**")
                .addResourceLocations("classpath:/static/JS/");
        
        registry.addResourceHandler("/IMG/**")
                .addResourceLocations("classpath:/static/IMG/");
    }
    
    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer.favorPathExtension(false);
    }
    
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/").setViewName("forward:/primera-pagina.html");
        registry.addViewController("/login").setViewName("forward:/login.html");
    }
}