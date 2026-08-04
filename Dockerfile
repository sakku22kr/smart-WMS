# ─── Stage 1: Build ───────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build

WORKDIR /app

# Copy backend pom.xml first (caches dependencies layer)
COPY backend/pom.xml .
RUN mvn dependency:go-offline -q

# Copy backend source and build JAR
COPY backend/src ./src
RUN mvn clean package -DskipTests -q

# ─── Stage 2: Runtime ─────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -S smartwms && adduser -S smartwms -G smartwms

# Copy JAR from build stage
COPY --from=build /app/target/smart-wms-backend-1.0.0.jar app.jar

# Create required runtime directories and set ownership for non-root user
RUN mkdir -p /app/logs /app/uploads && chown -R smartwms:smartwms /app

USER smartwms

# Expose port
EXPOSE 8080

# Run with MaxRAMPercentage so JVM auto-scales within Render 512MB RAM limit
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
