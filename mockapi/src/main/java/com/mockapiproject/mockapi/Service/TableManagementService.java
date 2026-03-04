package com.mockapiproject.mockapi.Service;

import com.mockapiproject.mockapi.DTO.ColumnDTO;
import com.mockapiproject.mockapi.Entity.DatabaseConnectionEntity;

import java.util.List;
import java.util.Map;

public interface TableManagementService {
    void createTable(DatabaseConnectionEntity connection, String tableName, List<ColumnDTO> columns);

    void dropTable(DatabaseConnectionEntity connection, String tableName);

    void addColumn(DatabaseConnectionEntity connection, String tableName, ColumnDTO column);

    void dropColumn(DatabaseConnectionEntity connection, String tableName, String columnName);

    void insertRow(DatabaseConnectionEntity connection, String tableName, Map<String, Object> data);

    void updateRow(DatabaseConnectionEntity connection, String tableName, Object rowId, Map<String, Object> data);

    void deleteRow(DatabaseConnectionEntity connection, String tableName, Object rowId);
}
