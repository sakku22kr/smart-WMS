# ─── Stage 1: Build ───────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copy pom.xml first (caches dependencies layer)
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build JAR
COPY src ./src
RUN mvn clean package -DskipTests -q

# ─── Stage 2: Runtime ─────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -S smartwms && adduser -S smartwms -G smartwms

# Copy JAR from build stage
COPY --from=build /app/target/smart-wms-backend-1.0.0.jar app.jar

# Set ownership
RUN chown smartwms:smartwms app.jar

USER smartwms

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Run
ENTRYPOINT ["java", "-jar", "app.jar"]
