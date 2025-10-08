package com.basketball.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 回调请求模型
 * 发送给Node.js服务的数据格式
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CallbackRequest {
    
    /**
     * 回调类型：gameState、gameEvent
     */
    private String type;
    
    /**
     * 会话ID
     */
    private String sessionId;
    
    /**
     * 数据内容（JSON字符串）
     */
    private String data;
    
    /**
     * 时间戳
     */
    private Long timestamp;
}

