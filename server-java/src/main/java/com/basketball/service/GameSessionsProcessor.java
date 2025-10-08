package com.basketball.service;

import com.alicloud.openservices.tablestore.model.StreamRecord;
import com.alicloud.openservices.tablestore.tunnel.worker.IChannelProcessor;
import com.alicloud.openservices.tablestore.tunnel.worker.ProcessRecordsInput;
import com.basketball.util.RecordParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * GameSessions表的通道处理器
 * 处理游戏会话状态变更
 */
@Component
public class GameSessionsProcessor implements IChannelProcessor {

    private static final Logger log = LoggerFactory.getLogger(GameSessionsProcessor.class);

    @Autowired
    private NotificationService notificationService;

    @Override
    public void process(ProcessRecordsInput input) {
        List<StreamRecord> records = input.getRecords();
        
        log.debug("📦 Processing {} GameSessions records", records.size());

        for (StreamRecord record : records) {
            try {
                // 只处理PUT类型的记录
                if (record.getRecordType() != StreamRecord.RecordType.PUT) {
                    continue;
                }

                // 解析主键获取sessionId
                Map<String, Object> primaryKey = RecordParser.parsePrimaryKey(
                    record.getPrimaryKey()
                );
                String sessionId = (String) primaryKey.get("sessionId");
                
                if (sessionId == null) {
                    log.warn("⚠️ Skipping record without sessionId");
                    continue;
                }

                // 解析属性列
                Map<String, Object> columns = RecordParser.parseColumns(
                    record.getColumns()
                );

                // 获取gameState字段
                String gameStateJson = (String) columns.get("gameState");
                if (gameStateJson == null) {
                    log.warn("⚠️ No gameState found for session {}", sessionId);
                    continue;
                }

                // 发送通知
                log.debug("📤 Sending gameState change notification for session: {}", 
                    sessionId);
                notificationService.notifyGameStateChange(sessionId, gameStateJson);

            } catch (Exception e) {
                log.error("❌ Error processing GameSessions record: {}", 
                    e.getMessage(), e);
                // 继续处理下一条记录，不中断整个批次
            }
        }
    }

    @Override
    public void shutdown() {
        log.info("🛑 GameSessionsProcessor shutting down");
    }
}

