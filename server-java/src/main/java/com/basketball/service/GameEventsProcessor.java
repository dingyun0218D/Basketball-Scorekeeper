package com.basketball.service;

import com.alicloud.openservices.tablestore.model.StreamRecord;
import com.alicloud.openservices.tablestore.model.tunnel.Record;
import com.alicloud.openservices.tablestore.model.tunnel.RecordType;
import com.alicloud.openservices.tablestore.tunnel.worker.ProcessRecordsInput;
import com.basketball.util.RecordParser;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * GameEvents表的记录处理器
 * 处理游戏事件变更
 */
@Component
@Slf4j
public class GameEventsProcessor implements RecordProcessor {

    @Autowired
    private NotificationService notificationService;

    @Override
    public void processRecords(ProcessRecordsInput input) {
        List<Record> records = input.getRecords();
        
        log.debug("📦 Processing {} GameEvents records", records.size());

        for (Record record : records) {
            try {
                // 只处理数据记录，跳过系统记录
                if (record.getRecordType() != RecordType.PUT) {
                    continue;
                }

                StreamRecord streamRecord = record.getStreamRecord();
                if (streamRecord == null) {
                    continue;
                }

                // 解析主键获取sessionId和eventId
                Map<String, Object> primaryKey = RecordParser.parsePrimaryKey(
                    streamRecord.getPrimaryKey()
                );
                String sessionId = (String) primaryKey.get("sessionId");
                String eventId = (String) primaryKey.get("eventId");
                
                if (sessionId == null || eventId == null) {
                    log.warn("⚠️ Skipping record without sessionId or eventId");
                    continue;
                }

                // 解析属性列
                Map<String, Object> columns = RecordParser.parseColumns(
                    streamRecord.getColumns()
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
}

