package com.mockapiproject.mockapi.Service;

import com.mockapiproject.mockapi.DTO.DatabaseConnectionDTO;

import java.util.List;
import java.util.UUID;

public interface DatabaseConnectionService {
    List<DatabaseConnectionDTO> getByAccount(UUID accountId);

    DatabaseConnectionDTO getById(UUID id);

    DatabaseConnectionDTO create(UUID accountId, DatabaseConnectionDTO dto);

    DatabaseConnectionDTO update(UUID id, DatabaseConnectionDTO dto);

    void delete(UUID id);

    boolean testConnection(DatabaseConnectionDTO dto);
}
