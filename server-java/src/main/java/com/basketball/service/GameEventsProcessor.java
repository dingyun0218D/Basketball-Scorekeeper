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
 * GameEvents表的通道处理器
 * 处理游戏事件变更
 */
@Component
public class GameEventsProcessor implements IChannelProcessor {

    private static final Logger log = LoggerFactory.getLogger(GameEventsProcessor.class);

    @Autowired
    private NotificationService notificationService;

    @Override
    public void process(ProcessRecordsInput input) {
        List<StreamRecord> records = input.getRecords();
        
        log.debug("📦 Processing {} GameEvents records", records.size());

        for (StreamRecord record : records) {
            try {
                // 只处理PUT类型的记录
                if (record.getRecordType() != StreamRecord.RecordType.PUT) {
                    continue;
                }

                // 解析主键获取sessionId和eventId
                Map<String, Object> primaryKey = RecordParser.parsePrimaryKey(
                    record.getPrimaryKey()
                );
                String sessionId = (String) primaryKey.get("sessionId");
                String eventId = (String) primaryKey.get("eventId");
                
                if (sessionId == null || eventId == null) {
                    log.warn("⚠️ Skipping record without sessionId or eventId");
                    continue;
                }

                // 解析属性列
                Map<String, Object> columns = RecordParser.parseColumns(
                    record.getColumns()
                );

                // 获取eventData字段
                String eventDataJson = (String) columns.get("eventData");
                if (eventDataJson == null) {
                    log.warn("⚠️ No eventData found for event {} in session {}", 
                        eventId, sessionId);
                    continue;
                }

                // 发送通知
                log.debug("📤 Sending gameEvent change notification for session: {}", 
                    sessionId);
                notificationService.notifyGameEventChange(sessionId, eventDataJson);

            } catch (Exception e) {
                log.error("❌ Error processing GameEvents record: {}", 
                    e.getMessage(), e);
                // 继续处理下一条记录，不中断整个批次
            }
        }
    }

    @Override
    public void shutdown() {
        log.info("🛑 GameEventsProcessor shutting down");
    }
}
