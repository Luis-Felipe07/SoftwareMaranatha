package com.maranatha.sfmaranatha.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration; // ¡AÑADE ESTA LÍNEA!
import io.swagger.v3.oas.models.ExternalDocumentation;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;

@Configuration 
public class OpenApiConfig {
     @Bean
    public OpenAPI maranathaApi() {
        return new OpenAPI()
            .info(new Info()
                .title("API Restaurante Maranatha") //
                .version("v1") //
                .description("Documentación de los servicios REST del proyecto") //
                .contact(new Contact().name("Luis Barrios").email("luisbarrios07112000@gmail.com")) //
            )
            .externalDocs(new ExternalDocumentation()
                .description("Repositorio en GitHub") //
                .url("https://github.com/Luis-Felipe07/SoftwareMaranatha") //
            );
    }
}