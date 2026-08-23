package com.auth_application.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(info = @Info(title="Auth Application API", version = "1.0", description = "API documentation for Auth Application",contact = @Contact(name = "sayan metya", email = "metyasayan3@gmail.com")),security = {@SecurityRequirement(name = "bearerAuth")})
@SecurityScheme(name = "bearerAuth", scheme = "bearer", type = SecuritySchemeType.HTTP,bearerFormat = "JWT")
public class AppConfig {
}
