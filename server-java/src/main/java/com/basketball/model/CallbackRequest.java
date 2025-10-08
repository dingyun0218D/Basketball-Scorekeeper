package com.basketball.model;

/**
 * 回调请求模型
 * 发送给Node.js服务的数据格式
 */
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

    // 构造函数
    public CallbackRequest() {
    }

    public CallbackRequest(String type, String sessionId, String data, Long timestamp) {
        this.type = type;
        this.sessionId = sessionId;
        this.data = data;
        this.timestamp = timestamp;
    }

    // Getter 和 Setter
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public String getData() {
        return data;
    }

    public void setData(String data) {
        this.data = data;
    }

    public Long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Long timestamp) {
        this.timestamp = timestamp;
    }

    // Builder 模式
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String type;
        private String sessionId;
        private String data;
        private Long timestamp;

        public Builder type(String type) {
            this.type = type;
            return this;
        }

        public Builder sessionId(String sessionId) {
            this.sessionId = sessionId;
            return this;
        }

        public Builder data(String data) {
            this.data = data;
            return this;
        }

        public Builder timestamp(Long timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public CallbackRequest build() {
            return new CallbackRequest(type, sessionId, data, timestamp);
        }
    }
}
