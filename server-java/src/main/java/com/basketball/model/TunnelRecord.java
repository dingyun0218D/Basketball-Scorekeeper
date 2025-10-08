package com.basketball.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Tunnel数据变更记录
 * 统一封装TableStore的数据变更通知
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TunnelRecord {
    
    /**
     * 变更类型：PUT（新增/更新）、DELETE（删除）
     */
    private String actionType;
    
    /**
     * 会话ID
     */
    private String sessionId;
    
    /**
     * 事件ID（仅事件表）
     */
    private String eventId;
    
    /**
     * 数据内容（JSON字符串）
     */
    private String data;
    
    /**
     * 时间戳
     */
    private Long timestamp;
    
    /**
     * 表名
     */
    private String tableName;
}

