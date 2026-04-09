package com.algolog.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
public class DatabaseConfig {

    @Value("${DATABASE_URL:#{null}}")
    private String databaseUrl;

    @Value("${spring.datasource.url}")
    private String defaultJdbcUrl;

    @Value("${DATABASE_USERNAME:}")
    private String username;

    @Value("${DATABASE_PASSWORD:}")
    private String password;

    @Value("${spring.datasource.hikari.maximum-pool-size:10}")
    private int maxPoolSize;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        if (databaseUrl != null && !databaseUrl.isEmpty()) {
            // Parse DATABASE_URL (Railway format)
            try {
                // Remove jdbc: prefix if present to parse as URI
                String urlToParse = databaseUrl.startsWith("jdbc:") 
                    ? databaseUrl.substring(5) 
                    : databaseUrl;

                URI dbUri = new URI(urlToParse);
                
                String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + ":" + dbUri.getPort() + dbUri.getPath();
                
                config.setJdbcUrl(dbUrl);
                
                // Extract username and password from URI if present
                if (dbUri.getUserInfo() != null) {
                    String[] credentials = dbUri.getUserInfo().split(":");
                    config.setUsername(credentials[0]);
                    if (credentials.length > 1) {
                        config.setPassword(credentials[1]);
                    }
                } else {
                    // Use separate username/password if not in URL
                    if (username != null && !username.isEmpty()) {
                        config.setUsername(username);
                    }
                    if (password != null && !password.isEmpty()) {
                        config.setPassword(password);
                    }
                }
            } catch (URISyntaxException e) {
                throw new RuntimeException("Invalid DATABASE_URL format", e);
            }
        } else {
            // Use default Spring datasource configuration
            config.setJdbcUrl(defaultJdbcUrl);
            if (username != null && !username.isEmpty()) {
                config.setUsername(username);
            }
            if (password != null && !password.isEmpty()) {
                config.setPassword(password);
            }
        }

        config.setMaximumPoolSize(maxPoolSize);
        config.setDriverClassName("org.postgresql.Driver");


        return new HikariDataSource(config);
    }
}
