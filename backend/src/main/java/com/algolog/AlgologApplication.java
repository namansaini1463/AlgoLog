package com.algolog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AlgologApplication {

    public static void main(String[] args) {
        SpringApplication.run(AlgologApplication.class, args);
    }
}
