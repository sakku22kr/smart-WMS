package com.smartwms.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * SpringDoc OpenAPI 3 configuration.
 *
 * <p>Swagger UI is available at {@code /swagger-ui.html}.
 * API docs (JSON) are at {@code /v3/api-docs}.</p>
 */
@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME = "Bearer Authentication";

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(buildInfo())
                .servers(buildServers())
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME, buildSecurityScheme()));
    }

    private Info buildInfo() {
        return new Info()
                .title("Smart WMS REST API")
                .description("""
                        # Smart Inventory & Warehouse Management System
                        
                        Production-grade REST API for managing inventory, warehouses, products, suppliers, and purchase orders.
                        
                        ## Authentication
                        All protected endpoints require a `Bearer <JWT>` token in the `Authorization` header.
                        Obtain a token via `POST /api/v1/auth/login`.
                        """)
                .version("1.0.0")
                .contact(new Contact()
                        .name("Smart WMS Team")
                        .email("dev@smartwms.io"))
                .license(new License()
                        .name("Private — All Rights Reserved"));
    }

    private List<Server> buildServers() {
        return List.of(
                new Server().url("http://localhost:8080").description("Local Development"),
                new Server().url("https://api.smartwms.io").description("Production")
        );
    }

    private SecurityScheme buildSecurityScheme() {
        return new SecurityScheme()
                .name(SECURITY_SCHEME)
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("Enter your JWT Bearer token");
    }
}
