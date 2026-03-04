package com.mockapiproject.mockapi.Service.Impl;

import com.mockapiproject.mockapi.DTO.ColumnDTO;
import com.mockapiproject.mockapi.DTO.RowDTO;
import com.mockapiproject.mockapi.DTO.TableDTO;
import com.mockapiproject.mockapi.Entity.DatabaseConnectionEntity;
import com.mockapiproject.mockapi.Enum.DatabaseType;
import com.mockapiproject.mockapi.Service.DatabaseMetadataService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DatabaseMetadataServiceImpl implements DatabaseMetadataService {

    @Override
    public List<TableDTO> getTables(DatabaseConnectionEntity connection) {
        List<TableDTO> tables = new ArrayList<>();

        String jdbcUrl = buildJdbcUrl(connection);

        try (java.sql.Connection conn = DriverManager.getConnection(
                jdbcUrl, connection.getUsername(), connection.getPassword())) {

            DatabaseMetaData metaData = conn.getMetaData();

            // Get primary keys for this database
            List<String> primaryKeys = getPrimaryKeys(metaData, connection.getDatabaseName());

            try (ResultSet rs = metaData.getTables(null, null, "%", new String[] { "TABLE" })) {
                while (rs.next()) {
                    String tableName = rs.getString("TABLE_NAME");
                    String tableSchema = rs.getString("TABLE_SCHEM");

                    // Get row count
                    long rowCount = getRowCount(conn, tableName);

                    TableDTO tableDTO = TableDTO.builder()
                            .name(tableName)
                            .schema(tableSchema)
                            .rowCount(rowCount)
                            .build();

                    tables.add(tableDTO);
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Failed to get tables: " + e.getMessage(), e);
        }

        return tables;
    }

    @Override
    public List<ColumnDTO> getColumns(DatabaseConnectionEntity connection, String tableName) {
        List<ColumnDTO> columns = new ArrayList<>();

        String jdbcUrl = buildJdbcUrl(connection);

        try (java.sql.Connection conn = DriverManager.getConnection(
                jdbcUrl, connection.getUsername(), connection.getPassword())) {

            DatabaseMetaData metaData = conn.getMetaData();

            // Get primary keys
            List<String> primaryKeys = getPrimaryKeys(metaData, connection.getDatabaseName());

            // Get auto increment columns
            List<String> autoIncrementColumns = getAutoIncrementColumns(conn, tableName);

            try (ResultSet rs = metaData.getColumns(null, null, tableName, "%")) {
                while (rs.next()) {
                    String columnName = rs.getString("COLUMN_NAME");
                    String columnType = rs.getString("TYPE_NAME");
                    int dataType = rs.getInt("DATA_TYPE");
                    int columnSize = rs.getInt("COLUMN_SIZE");
                    int decimalDigits = rs.getInt("DECIMAL_DIGITS");
                    int numPrecRadix = rs.getInt("NUM_PREC_RADIX");
                    int nullable = rs.getInt("NULLABLE");
                    String columnDef = rs.getString("COLUMN_DEF");
                    String remarks = rs.getString("REMARKS");

                    ColumnDTO columnDTO = ColumnDTO.builder()
                            .name(columnName)
                            .type(columnType)
                            .size(columnSize)
                            .precision(numPrecRadix)
                            .scale(decimalDigits)
                            .isNullable(nullable == DatabaseMetaData.columnNullable)
                            .isPrimaryKey(primaryKeys.contains(columnName))
                            .isAutoIncrement(autoIncrementColumns.contains(columnName))
                            .defaultValue(columnDef)
                            .comment(remarks)
                            .build();

                    columns.add(columnDTO);
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Failed to get columns: " + e.getMessage(), e);
        }

        return columns;
    }

    @Override
    public List<RowDTO> getRows(DatabaseConnectionEntity connection, String tableName, int limit, int offset) {
        List<RowDTO> rows = new ArrayList<>();

        String jdbcUrl = buildJdbcUrl(connection);

        try (java.sql.Connection conn = DriverManager.getConnection(
                jdbcUrl, connection.getUsername(), connection.getPassword())) {

            // Get primary key column for this table
            String primaryKeyColumn = getPrimaryKeyColumn(conn, tableName);

            String query = String.format("SELECT * FROM \"%s\" LIMIT %d OFFSET %d", tableName, limit, offset);

            try (Statement stmt = conn.createStatement();
                    ResultSet rs = stmt.executeQuery(query)) {

                ResultSetMetaData metaData = rs.getMetaData();
                int columnCount = metaData.getColumnCount();

                while (rs.next()) {
                    java.util.Map<String, Object> rowData = new java.util.LinkedHashMap<>();
                    Object id = null;

                    for (int i = 1; i <= columnCount; i++) {
                        String columnName = metaData.getColumnName(i);
                        Object value = rs.getObject(i);

                        rowData.put(columnName, value);

                        if (primaryKeyColumn != null && columnName.equalsIgnoreCase(primaryKeyColumn)) {
                            id = value;
                        }
                    }

                    rows.add(RowDTO.builder()
                            .data(rowData)
                            .id(id)
                            .build());
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Failed to get rows: " + e.getMessage(), e);
        }

        return rows;
    }

    @Override
    public int getTotalRows(DatabaseConnectionEntity connection, String tableName) {
        String jdbcUrl = buildJdbcUrl(connection);

        try (java.sql.Connection conn = DriverManager.getConnection(
                jdbcUrl, connection.getUsername(), connection.getPassword())) {

            String query = String.format("SELECT COUNT(*) FROM \"%s\"", tableName);

            try (Statement stmt = conn.createStatement();
                    ResultSet rs = stmt.executeQuery(query)) {

                if (rs.next()) {
                    return rs.getInt(1);
                }
            }

        } catch (SQLException e) {
            throw new RuntimeException("Failed to get row count: " + e.getMessage(), e);
        }

        return 0;
    }

    private List<String> getPrimaryKeys(DatabaseMetaData metaData, String databaseName) throws SQLException {
        List<String> primaryKeys = new ArrayList<>();
        try (ResultSet rs = metaData.getPrimaryKeys(null, null, "%")) {
            while (rs.next()) {
                primaryKeys.add(rs.getString("COLUMN_NAME"));
            }
        }
        return primaryKeys;
    }

    private List<String> getAutoIncrementColumns(java.sql.Connection conn, String tableName) throws SQLException {
        List<String> autoIncColumns = new ArrayList<>();

        DatabaseMetaData metaData = conn.getMetaData();

        try (ResultSet rs = metaData.getColumns(null, null, tableName, "%")) {
            while (rs.next()) {
                String isAutoIncrement = rs.getString("IS_AUTOINCREMENT");
                if ("YES".equalsIgnoreCase(isAutoIncrement)) {
                    autoIncColumns.add(rs.getString("COLUMN_NAME"));
                }
            }
        }

        return autoIncColumns;
    }

    private String getPrimaryKeyColumn(java.sql.Connection conn, String tableName) throws SQLException {
        DatabaseMetaData metaData = conn.getMetaData();

        try (ResultSet rs = metaData.getPrimaryKeys(null, null, tableName)) {
            if (rs.next()) {
                return rs.getString("COLUMN_NAME");
            }
        }

        return null;
    }

    private long getRowCount(java.sql.Connection conn, String tableName) {
        try {
            String query = String.format("SELECT COUNT(*) FROM \"%s\"", tableName);
            try (Statement stmt = conn.createStatement();
                    ResultSet rs = stmt.executeQuery(query)) {
                if (rs.next()) {
                    return rs.getLong(1);
                }
            }
        } catch (SQLException e) {
            // Ignore - row count is optional
        }
        return 0L;
    }

    private String buildJdbcUrl(DatabaseConnectionEntity connection) {
        if (connection.getDatabaseType() == DatabaseType.POSTGRESQL) {
            return String.format("jdbc:postgresql://%s:%d/%s?sslmode=require",
                    connection.getHost(), connection.getPort(), connection.getDatabaseName());
        } else if (connection.getDatabaseType() == DatabaseType.MYSQL) {
            return String.format("jdbc:mysql://%s:%d/%s?useSSL=false&allowPublicKeyRetrieval=true",
                    connection.getHost(), connection.getPort(), connection.getDatabaseName());
        }
        throw new RuntimeException("Unsupported database type");
    }
}
