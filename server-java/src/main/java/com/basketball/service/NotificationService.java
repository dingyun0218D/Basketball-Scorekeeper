package com.basketball.service;

import com.basketball.config.TableStoreConfig;
import com.basketball.model.CallbackRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * 通知服务
 * 负责向Node.js服务发送HTTP回调通知
 */
@Service
@Slf4j
public class NotificationService {

    private final OkHttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String callbackUrl;
    
    private static final MediaType JSON_MEDIA_TYPE = 
        MediaType.get("application/json; charset=utf-8");

    @Autowired
    public NotificationService(TableStoreConfig config) {
        this.callbackUrl = config.getNodejsCallbackUrl();
        this.objectMapper = new ObjectMapper();
        
        // 配置HTTP客户端
        this.httpClient = new OkHttpClient.Builder()
            .connectTimeout(5, TimeUnit.SECONDS)
            .writeTimeout(5, TimeUnit.SECONDS)
            .readTimeout(5, TimeUnit.SECONDS)
            .retryOnConnectionFailure(true)
            .build();
        
        log.info("✅ NotificationService initialized, callback URL: {}", callbackUrl);
    }

    /**
     * 发送游戏状态变更通知
     */
    public void notifyGameStateChange(String sessionId, String gameStateJson) {
        CallbackRequest request = CallbackRequest.builder()
            .type("gameState")
            .sessionId(sessionId)
            .data(gameStateJson)
            .timestamp(System.currentTimeMillis())
            .build();
        
        sendCallback(request);
    }

    /**
     * 发送游戏事件变更通知
     */
    public void notifyGameEventChange(String sessionId, String eventJson) {
        CallbackRequest request = CallbackRequest.builder()
            .type("gameEvent")
            .sessionId(sessionId)
            .data(eventJson)
            .timestamp(System.currentTimeMillis())
            .build();
        
        sendCallback(request);
    }

    /**
     * 发送HTTP回调
     */
    private void sendCallback(CallbackRequest callbackRequest) {
        try {
            String jsonBody = objectMapper.writeValueAsString(callbackRequest);
            RequestBody body = RequestBody.create(jsonBody, JSON_MEDIA_TYPE);
            
            Request request = new Request.Builder()
                .url(callbackUrl + "/api/tunnel/callback")
                .post(body)
                .build();
            
            // 异步发送，避免阻塞Tunnel处理
            httpClient.newCall(request).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    log.error("❌ Failed to send callback for session {}: {}", 
                        callbackRequest.getSessionId(), e.getMessage());
                }

                @Override
                public void onResponse(Call call, Response response) throws IOException {
                    try (ResponseBody responseBody = response.body()) {
                        if (response.isSuccessful()) {
                            log.debug("✅ Callback sent successfully for session {}", 
                                callbackRequest.getSessionId());
                        } else {
                            log.warn("⚠️ Callback failed with status {} for session {}", 
                                response.code(), callbackRequest.getSessionId());
                        }
                    }
                }
            });
            
        } catch (Exception e) {
            log.error("❌ Error preparing callback: {}", e.getMessage(), e);
        }
    }
}

