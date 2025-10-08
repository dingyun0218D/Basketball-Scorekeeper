package com.basketball.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 健康检查控制器
 * 提供服务状态查询接口
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    private static final Logger log = LoggerFactory.getLogger(HealthController.class);

    /**
     * 健康检查接口
     */
    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("service", "basketball-tunnel-service");
        response.put("timestamp", System.currentTimeMillis());
        
        log.debug("Health check requested");
        
        return response;
    }

    /**
     * 服务信息接口
     */
    @GetMapping("/info")
    public Map<String, Object> info() {
        Map<String, Object> response = new HashMap<>();
        response.put("service", "Basketball Scorekeeper Tunnel Service");
        response.put("version", "1.0.0");
        response.put("description", "TableStore Tunnel Service for real-time data sync");
        
        return response;
    }
}

