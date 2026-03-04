package com.mockapiproject.mockapi.Controller;

import com.mockapiproject.mockapi.DTO.ColumnDTO;
import com.mockapiproject.mockapi.DTO.DatabaseConnectionDTO;
import com.mockapiproject.mockapi.DTO.RowDTO;
import com.mockapiproject.mockapi.DTO.TableDTO;
import com.mockapiproject.mockapi.Entity.DatabaseConnectionEntity;
import com.mockapiproject.mockapi.Repository.DatabaseConnectionRepository;
import com.mockapiproject.mockapi.Service.DatabaseConnectionService;
import com.mockapiproject.mockapi.Service.DatabaseMetadataService;
import com.mockapiproject.mockapi.Service.TableManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/databases")
@RequiredArgsConstructor
public class DatabaseController {

    private final DatabaseConnectionService databaseConnectionService;
    private final DatabaseMetadataService databaseMetadataService;
    private final TableManagementService tableManagementService;
    private final DatabaseConnectionRepository databaseConnectionRepository;

    // ========== Connection Management ==========

    @GetMapping
    public List<DatabaseConnectionDTO> list(@RequestParam UUID accountId) {
        return databaseConnectionService.getByAccount(accountId);
    }

    @GetMapping("/{id}")
    public DatabaseConnectionDTO get(@PathVariable UUID id) {
        return databaseConnectionService.getById(id);
    }

    @PostMapping
    public DatabaseConnectionDTO create(@RequestParam UUID accountId, @RequestBody DatabaseConnectionDTO dto) {
        return databaseConnectionService.create(accountId, dto);
    }

    @PutMapping("/{id}")
    public DatabaseConnectionDTO update(@PathVariable UUID id, @RequestBody DatabaseConnectionDTO dto) {
        return databaseConnectionService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        databaseConnectionService.delete(id);
    }

    @PostMapping("/test")
    public boolean testConnection(@RequestBody DatabaseConnectionDTO dto) {
        return databaseConnectionService.testConnection(dto);
    }

    // ========== Table Operations ==========

    @GetMapping("/{id}/tables")
    public List<TableDTO> listTables(@PathVariable UUID id) {
        DatabaseConnectionEntity connection = getConnectionEntity(id);
        return databaseMetadataService.getTables(connection);
    }

    @PostMapping("/{id}/tables")
    public void createTable(@PathVariable UUID id, @RequestBody Map<String, Object> payload) {
        DatabaseConnectionEntity connection = getConnectionEntity(id);
        String tableName = (String) payload.get("tableName");

        @SuppressWarnings("unchecked")
        List<ColumnDTO> columns = (List<ColumnDTO>) payload.get("columns");

        tableManagementService.createTable(connection, tableName, columns);
    }

    @DeleteMapping("/{id}/tables/{tableName}")
    public void dropTable(@PathVariable UUID id, @PathVariable String tableName) {
        DatabaseConnectionEntity connection = getConnectionEntity(id);
        tableManagementService.dropTable(connection, tableName);
    }

    // ========== Column Operations ==========

    @GetMapping("/{id}/tables/{tableName}/columns")
    public List<ColumnDTO> listColumns(@PathVariable UUID id, @PathVariable String tableName) {
        DatabaseConnectionEntity connection = getConnectionEntity(id);
        return databaseMetadataService.getColumns(connection, tableName);
    }

    @PostMapping("/{id}/tables/{tableName}/columns")
    public void addColumn(@PathVariable UUID id, @PathVariable String tableName, @RequestBody ColumnDTO column) {
        DatabaseConnectionEntity connection = getConnectionEntity(id);
        tableManagementService.addColumn(connection, tableName, column);
    }

    @DeleteMapping("/{id}/tables/{tableName}/columns/{columnName}")
    public void dropColumn(@PathVariable UUID id, @PathVariable String tableName, @PathVariable String columnName) {
        DatabaseConnectionEntity connection = getConnectionEntity(id);
        tableManagementService.dropColumn(connection, tableName, columnName);
    }

    // ========== Row Operations ==========

    @GetMapping("/{id}/tables/{tableName}/rows")
    public List<RowDTO> listRows(
            @PathVariable UUID id,
            @PathVariable String tableName,
            @RequestParam(defaultValue = "50") int limit,
            @RequestParam(defaultValue = "0") int offset) {
        DatabaseConnectionEntity connection = getConnectionEntity(id);
        return databaseMetadataService.getRows(connection, tableName, limit, offset);
    }

    @GetMapping("/{id}/tables/{tableName}/rows/count")
    public int getRowCount(@PathVariable UUID id, @PathVariable String tableName) {
        DatabaseConnectionEntity connection = getConnectionEntity(id);
        return databaseMetadataService.getTotalRows(connection, tableName);
    }

    @PostMapping("/{id}/tables/{tableName}/rows")
    public void insertRow(@PathVariable UUID id, @PathVariable String tableName,
            @RequestBody Map<String, Object> data) {
        DatabaseConnectionEntity connection = getConnectionEntity(id);
        tableManagementService.insertRow(connection, tableName, data);
    }

    @PutMapping("/{id}/tables/{tableName}/rows/{rowId}")
    public void updateRow(
            @PathVariable UUID id,
            @PathVariable String tableName,
            @PathVariable String rowId,
            @RequestBody Map<String, Object> data) {
        DatabaseConnectionEntity connection = getConnectionEntity(id);
        tableManagementService.updateRow(connection, tableName, rowId, data);
    }

    @DeleteMapping("/{id}/tables/{tableName}/rows/{rowId}")
    public void deleteRow(@PathVariable UUID id, @PathVariable String tableName, @PathVariable String rowId) {
        DatabaseConnectionEntity connection = getConnectionEntity(id);
        tableManagementService.deleteRow(connection, tableName, rowId);
    }

    // ========== Helper Methods ==========

    private DatabaseConnectionEntity getConnectionEntity(UUID id) {
        return databaseConnectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Database connection not found"));
    }
}
