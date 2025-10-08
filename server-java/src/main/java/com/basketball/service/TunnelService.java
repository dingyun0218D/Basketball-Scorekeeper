package com.basketball.service;

import com.alicloud.openservices.tablestore.TunnelClient;
import com.alicloud.openservices.tablestore.model.tunnel.*;
import com.alicloud.openservices.tablestore.tunnel.worker.IChannelProcessor;
import com.alicloud.openservices.tablestore.tunnel.worker.ProcessRecordsInput;
import com.alicloud.openservices.tablestore.tunnel.worker.TunnelWorker;
import com.alicloud.openservices.tablestore.tunnel.worker.TunnelWorkerConfig;
import com.basketball.config.TableStoreConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;

/**
 * Tunnel服务
 * 监听TableStore数据变更并触发回调
 */
@Service
public class TunnelService {

    private static final Logger log = LoggerFactory.getLogger(TunnelService.class);

    @Autowired
    private TunnelClient tunnelClient;

    @Autowired
    private TableStoreConfig config;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private GameSessionsProcessor gameSessionsProcessor;

    @Autowired
    private GameEventsProcessor gameEventsProcessor;

    private TunnelWorker gameSessionsWorker;
    private TunnelWorker gameEventsWorker;

    /**
     * 启动Tunnel监听
     */
    @PostConstruct
    public void start() {
        try {
            log.info("🚇 Starting Tunnel Service...");

            // 启动GameSessions Tunnel
            startGameSessionsTunnel();

            // 启动GameEvents Tunnel
            startGameEventsTunnel();

            log.info("✅ Tunnel Service started successfully");
        } catch (Exception e) {
            log.error("❌ Failed to start Tunnel Service: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to start Tunnel Service", e);
        }
    }

    /**
     * 停止Tunnel监听
     */
    @PreDestroy
    public void stop() {
        try {
            log.info("🛑 Stopping Tunnel Service...");

            if (gameSessionsWorker != null) {
                gameSessionsWorker.shutdown();
                log.info("✅ GameSessions Tunnel worker stopped");
            }

            if (gameEventsWorker != null) {
                gameEventsWorker.shutdown();
                log.info("✅ GameEvents Tunnel worker stopped");
            }

            log.info("✅ Tunnel Service stopped");
        } catch (Exception e) {
            log.error("❌ Error stopping Tunnel Service: {}", e.getMessage(), e);
        }
    }

    /**
     * 启动GameSessions表的Tunnel监听
     */
    private void startGameSessionsTunnel() {
        String tunnelId = config.getGameSessionsTunnelId();
        
        TunnelWorkerConfig workerConfig = new TunnelWorkerConfig(
            gameSessionsProcessor
        );

        gameSessionsWorker = new TunnelWorker(
            tunnelId,
            tunnelClient,
            workerConfig
        );

        try {
            gameSessionsWorker.connectAndWorking();
            log.info("✅ GameSessions Tunnel connected: {}", tunnelId);
        } catch (Exception e) {
            log.error("❌ Failed to connect GameSessions Tunnel: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to connect GameSessions Tunnel", e);
        }
    }

    /**
     * 启动GameEvents表的Tunnel监听
     */
    private void startGameEventsTunnel() {
        String tunnelId = config.getGameEventsTunnelId();
        
        TunnelWorkerConfig workerConfig = new TunnelWorkerConfig(
            gameEventsProcessor
        );

        gameEventsWorker = new TunnelWorker(
            tunnelId,
            tunnelClient,
            workerConfig
        );

        try {
            gameEventsWorker.connectAndWorking();
            log.info("✅ GameEvents Tunnel connected: {}", tunnelId);
        } catch (Exception e) {
            log.error("❌ Failed to connect GameEvents Tunnel: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to connect GameEvents Tunnel", e);
        }
    }
}

