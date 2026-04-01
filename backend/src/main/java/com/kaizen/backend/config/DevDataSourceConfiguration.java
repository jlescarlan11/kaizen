package com.kaizen.backend.config;

import jakarta.annotation.PreDestroy;
import javax.sql.DataSource;
import java.util.Objects;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.core.env.Environment;
import org.springframework.util.StringUtils;
import org.testcontainers.containers.PostgreSQLContainer;

import java.net.InetSocketAddress;
import java.net.Socket;

@Configuration(proxyBeanMethods = false)
@Profile("dev")
public class DevDataSourceConfiguration {

    private static final Logger log = LoggerFactory.getLogger(DevDataSourceConfiguration.class);
    private PostgreSQLContainer<?> embeddedContainer;

    @Bean
    @Primary
    public DataSource dataSource(Environment environment) {
        boolean useEmbedded = getBoolean(environment, "DB_USE_EMBEDDED", false);
        if (useEmbedded) {
            DataSource embedded = tryBuildEmbedded(environment);
            if (embedded != null) {
                log.info("********************************************************************************");
                log.info("RUNNING WITH EMBEDDED POSTGRES (TESTCONTAINERS)");
                log.info("");
                log.info("Your data is being stored in a temporary container.");
                log.info("ALL DATA WILL BE WIPED ON APP RESTART.");
                log.info("");
                log.info("To persist data, set DB_USE_EMBEDDED=false and run:");
                log.info("   docker compose up -d");
                log.info("********************************************************************************");
                return embedded;
            }

            boolean fallbackToH2 = getBoolean(environment, "DB_FALLBACK_TO_H2", false);
            if (fallbackToH2) {
                log.info("Embedded Postgres container could not start; falling back to H2 in-memory database.");
                return buildH2DataSource();
            }

            log.error("********************************************************************************");
            log.error("ERROR: DOCKER IS NOT RUNNING OR UNAVAILABLE");
            log.error("");
            log.error("The Kaizen backend requires Docker to run PostgreSQL.");
            log.error("Since Docker is not running, the application cannot start a persistent database.");
            log.error("Falling back to an in-memory database would cause all your data to be wiped on restart.");
            log.error("");
            log.error("To fix this:");
            log.error("1. Ensure Docker Desktop (or your Docker engine) is started.");
            log.error("2. Run the following command from the backend directory:");
            log.error("   docker compose up -d");
            log.error("********************************************************************************");

            throw new RuntimeException("Docker is required for the application to start with a persistent database. " +
                    "Please start Docker and run 'docker compose up -d' in the backend directory.");
        }
        return buildJdbcDataSource(environment);
    }

    @SuppressWarnings("resource")
    private DataSource tryBuildEmbedded(Environment environment) {
        String image = environment.getProperty("DB_EMBEDDED_IMAGE", "postgres:16-alpine");
        PostgreSQLContainer<?> container = new PostgreSQLContainer<>(image)
                .withDatabaseName(environment.getProperty("DB_EMBEDDED_NAME", "kaizen_dev"))
                .withUsername(environment.getProperty("DB_EMBEDDED_USER", "kaizen"))
                .withPassword(environment.getProperty("DB_EMBEDDED_PASSWORD", "kaizen"));
        try {
            container.start();
            embeddedContainer = container;
            log.info("Started embedded Postgres for dev profile on {}", embeddedContainer.getJdbcUrl());
            return buildDataSourceFromContainer(embeddedContainer);
        } catch (Exception ex) {
            log.warn("Failed to start embedded Postgres container", ex);
            container.close();
            return null;
        }
    }

    private DataSource buildDataSourceFromContainer(PostgreSQLContainer<?> container) {
        return DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .driverClassName(container.getDriverClassName())
                .url(container.getJdbcUrl())
                .username(container.getUsername())
                .password(container.getPassword())
                .build();
    }

    private DataSource buildH2DataSource() {
        return DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .driverClassName("org.h2.Driver")
                .url("jdbc:h2:mem:kaizen;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_UPPER=false")
                .username("sa")
                .password("")
                .build();
    }

    private DataSource buildJdbcDataSource(Environment environment) {
        String url = environment.getProperty("DB_URL", "");
        String host = Objects.requireNonNullElse(environment.getProperty("DB_HOST", "localhost"), "localhost");
        String port = Objects.requireNonNullElse(environment.getProperty("DB_PORT", "55432"), "55432");
        String database = Objects.requireNonNullElse(environment.getProperty("DB_NAME", "kaizen"), "kaizen");

        if (!StringUtils.hasText(url)) {
            url = String.format("jdbc:postgresql://%s:%s/%s", host, port, database);
        }

        if (host.equals("localhost") || host.equals("127.0.0.1")) {
            checkDatabaseReachability(host, port);
        }

        return DataSourceBuilder.create()
                .type(HikariDataSource.class)
                .driverClassName(environment.getProperty("DB_DRIVER", "org.postgresql.Driver"))
                .url(url)
                .username(Objects.requireNonNullElse(environment.getProperty("DB_USER", "kaizen"), "kaizen"))
                .password(Objects.requireNonNullElse(environment.getProperty("DB_PASSWORD", "kaizen"), "kaizen"))
                .build();
    }

    private void checkDatabaseReachability(String host, String port) {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, Integer.parseInt(port)), 1000);
        } catch (Exception ex) {
            log.error("********************************************************************************");
            log.error("ERROR: DATABASE NOT REACHABLE ON {}:{}", host, port);
            log.error("");
            log.error("The Kaizen backend requires PostgreSQL to be running.");
            log.error("It seems Docker is not running or the database container is not started.");
            log.error("");
            log.error("To fix this:");
            log.error("1. Ensure Docker Desktop (or your Docker engine) is started.");
            log.error("2. Run the following command from the backend directory:");
            log.error("   docker compose up -d");
            log.error("********************************************************************************");

            throw new RuntimeException("PostgreSQL is required on port " + port + ". Please start Docker and run 'docker compose up -d'.", ex);
        }
    }

    @SuppressWarnings("null")
    private boolean getBoolean(Environment environment, String property, boolean defaultValue) {
        String fallback = String.valueOf(defaultValue);
        String raw = environment.getProperty(property, fallback);
        return Boolean.parseBoolean(raw != null ? raw : fallback);
    }

    @PreDestroy
    void stopEmbeddedPostgres() {
        if (embeddedContainer != null && embeddedContainer.isRunning()) {
            embeddedContainer.stop();
        }
    }
}