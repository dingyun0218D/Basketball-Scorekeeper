package com.basketball;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

/**
 * Basketball Scorekeeper Tunnel Service
 * 主应用入口
 */
@SpringBootApplication
@ComponentScan(basePackages = "com.basketball")
@Slf4j
public class TunnelApplication {

    public static void main(String[] args) {
        try {
            log.info("🚀 Starting Basketball Scorekeeper Tunnel Service...");
            log.info("=" .repeat(60));
            
            SpringApplication.run(TunnelApplication.class, args);
            
            log.info("=" .repeat(60));
            log.info("✅ Basketball Scorekeeper Tunnel Service started successfully!");
            
        } catch (Exception e) {
            log.error("❌ Failed to start Tunnel Service: {}", e.getMessage(), e);
            System.exit(1);
        }
    }
}

