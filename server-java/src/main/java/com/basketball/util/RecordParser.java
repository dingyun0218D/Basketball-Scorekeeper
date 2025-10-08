package com.basketball.util;

import com.alicloud.openservices.tablestore.model.Column;
import com.alicloud.openservices.tablestore.model.ColumnValue;
import com.alicloud.openservices.tablestore.model.ColumnType;
import com.alicloud.openservices.tablestore.model.PrimaryKey;
import com.alicloud.openservices.tablestore.model.PrimaryKeyColumn;
import com.alicloud.openservices.tablestore.model.RecordColumn;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * TableStore记录解析工具
 * 解析主键和属性列
 */
public class RecordParser {

    /**
     * 解析主键（从PrimaryKey对象）
     */
    public static Map<String, Object> parsePrimaryKey(PrimaryKey primaryKey) {
        Map<String, Object> result = new HashMap<>();
        
        if (primaryKey == null) {
            return result;
        }

        for (PrimaryKeyColumn column : primaryKey.getPrimaryKeyColumns()) {
            String name = column.getName();
            Object value = column.getValue().asString();
            result.put(name, value);
        }

        return result;
    }

    /**
     * 解析属性列
     */
    public static Map<String, Object> parseColumns(List<RecordColumn> columns) {
        Map<String, Object> result = new HashMap<>();
        
        if (columns == null) {
            return result;
        }

        for (RecordColumn column : columns) {
            String name = column.getColumn().getName();
            ColumnValue value = column.getColumn().getValue();
            
            // 根据类型转换值
            Object parsedValue = parseColumnValue(value);
            result.put(name, parsedValue);
        }

        return result;
    }

    /**
     * 解析列值
     */
    private static Object parseColumnValue(ColumnValue value) {
        ColumnType type = value.getType();
        
        switch (type) {
            case STRING:
                return value.asString();
            case INTEGER:
                return value.asLong();
            case DOUBLE:
                return value.asDouble();
            case BOOLEAN:
                return value.asBoolean();
            case BINARY:
                return value.asBinary();
            default:
                return value.toString();
        }
    }
}
