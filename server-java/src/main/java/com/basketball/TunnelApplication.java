package com.basketball;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

/**
 * Basketball Scorekeeper Tunnel Service
 * 主应用入口
 */
@SpringBootApplication
@ComponentScan(basePackages = "com.basketball")
public class TunnelApplication {

    private static final Logger log = LoggerFactory.getLogger(TunnelApplication.class);

    public static void main(String[] args) {
        try {
            log.info("🚀 Starting Basketball Scorekeeper Tunnel Service...");
            log.info("============================================================");
            
            SpringApplication.run(TunnelApplication.class, args);
            
            log.info("============================================================");
            log.info("✅ Basketball Scorekeeper Tunnel Service started successfully!");
            
        } catch (Exception e) {
            log.error("❌ Failed to start Tunnel Service: {}", e.getMessage(), e);
            System.exit(1);
        }
    }
}

