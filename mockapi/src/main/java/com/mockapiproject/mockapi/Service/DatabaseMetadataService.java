package com.mockapiproject.mockapi.Service;

import com.mockapiproject.mockapi.DTO.ColumnDTO;
import com.mockapiproject.mockapi.DTO.RowDTO;
import com.mockapiproject.mockapi.DTO.TableDTO;
import com.mockapiproject.mockapi.Entity.DatabaseConnectionEntity;

import java.util.List;

public interface DatabaseMetadataService {
    List<TableDTO> getTables(DatabaseConnectionEntity connection);

    List<ColumnDTO> getColumns(DatabaseConnectionEntity connection, String tableName);

    List<RowDTO> getRows(DatabaseConnectionEntity connection, String tableName, int limit, int offset);

    int getTotalRows(DatabaseConnectionEntity connection, String tableName);
}
