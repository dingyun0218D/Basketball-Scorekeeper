package com.basketball.config;

import com.alicloud.openservices.tablestore.SyncClient;
import com.alicloud.openservices.tablestore.TunnelClient;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * TableStore配置类
 * 管理TableStore和Tunnel客户端的初始化
 */
@Configuration
@Data
public class TableStoreConfig {

    @Value("${tablestore.endpoint}")
    private String endpoint;

    @Value("${tablestore.instance-name}")
    private String instanceName;

    @Value("${tablestore.access-key-id}")
    private String accessKeyId;

    @Value("${tablestore.access-key-secret}")
    private String accessKeySecret;

    @Value("${tunnel.game-sessions-id}")
    private String gameSessionsTunnelId;

    @Value("${tunnel.game-events-id}")
    private String gameEventsTunnelId;

    @Value("${callback.nodejs-url}")
    private String nodejsCallbackUrl;

    /**
     * 创建TableStore同步客户端
     */
    @Bean
    public SyncClient syncClient() {
        return new SyncClient(
            endpoint,
            accessKeyId,
            accessKeySecret,
            instanceName
        );
    }

    /**
     * 创建Tunnel客户端
     */
    @Bean
    public TunnelClient tunnelClient() {
        return new TunnelClient(
            endpoint,
            accessKeyId,
            accessKeySecret,
            instanceName
        );
    }
}

