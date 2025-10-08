package com.basketball.service;

import com.alicloud.openservices.tablestore.tunnel.worker.ProcessRecordsInput;

/**
 * Tunnel记录处理器接口
 */
public interface RecordProcessor {
    
    /**
     * 处理Tunnel推送的记录
     */
    void processRecords(ProcessRecordsInput input);
}

