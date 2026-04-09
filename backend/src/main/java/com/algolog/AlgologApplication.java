package com.algolog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
public class AlgologApplication {

    public static void main(String[] args) {
        // Fix legacy "Asia/Calcutta" timezone that Railway PostgreSQL rejects
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Kolkata"));
        SpringApplication.run(AlgologApplication.class, args);
    }
}
