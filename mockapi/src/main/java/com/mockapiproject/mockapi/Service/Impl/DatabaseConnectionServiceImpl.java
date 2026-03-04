package com.mockapiproject.mockapi.Service.Impl;

import com.mockapiproject.mockapi.DTO.DatabaseConnectionDTO;
import com.mockapiproject.mockapi.Entity.AccountEntity;
import com.mockapiproject.mockapi.Entity.DatabaseConnectionEntity;
import com.mockapiproject.mockapi.Enum.DatabaseMode;
import com.mockapiproject.mockapi.Enum.DatabaseType;
import com.mockapiproject.mockapi.Repository.AccountRepository;
import com.mockapiproject.mockapi.Repository.DatabaseConnectionRepository;
import com.mockapiproject.mockapi.Service.DatabaseConnectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DatabaseConnectionServiceImpl implements DatabaseConnectionService {

    private final DatabaseConnectionRepository databaseConnectionRepository;
    private final AccountRepository accountRepository;

    @Override
    public List<DatabaseConnectionDTO> getByAccount(UUID accountId) {
        return databaseConnectionRepository.findByAccountId(accountId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DatabaseConnectionDTO getById(UUID id) {
        DatabaseConnectionEntity entity = databaseConnectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Database connection not found"));
        return toDTO(entity);
    }

    @Override
    @Transactional
    public DatabaseConnectionDTO create(UUID accountId, DatabaseConnectionDTO dto) {
        AccountEntity account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        DatabaseConnectionEntity entity = DatabaseConnectionEntity.builder()
                .account(account)
                .name(dto.getName())
                .databaseType(dto.getDatabaseType())
                .host(dto.getHost())
                .port(dto.getPort())
                .databaseName(dto.getDatabaseName())
                .username(dto.getUsername())
                .password(dto.getPassword())
                .mode(dto.getMode() != null ? dto.getMode() : DatabaseMode.SHARED)
                .isActive(true)
                .build();

        entity = databaseConnectionRepository.save(entity);
        return toDTO(entity);
    }

    @Override
    @Transactional
    public DatabaseConnectionDTO update(UUID id, DatabaseConnectionDTO dto) {
        DatabaseConnectionEntity entity = databaseConnectionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Database connection not found"));

        if (dto.getName() != null) {
            entity.setName(dto.getName());
        }
        if (dto.getDatabaseType() != null) {
            entity.setDatabaseType(dto.getDatabaseType());
        }
        if (dto.getHost() != null) {
            entity.setHost(dto.getHost());
        }
        if (dto.getPort() != null) {
            entity.setPort(dto.getPort());
        }
        if (dto.getDatabaseName() != null) {
            entity.setDatabaseName(dto.getDatabaseName());
        }
        if (dto.getUsername() != null) {
            entity.setUsername(dto.getUsername());
        }
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            entity.setPassword(dto.getPassword());
        }
        if (dto.getMode() != null) {
            entity.setMode(dto.getMode());
        }
        if (dto.getIsActive() != null) {
            entity.setIsActive(dto.getIsActive());
        }

        entity = databaseConnectionRepository.save(entity);
        return toDTO(entity);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        databaseConnectionRepository.deleteById(id);
    }

    @Override
    public boolean testConnection(DatabaseConnectionDTO dto) {
        try {
            String jdbcUrl = buildJdbcUrl(dto);
            Class.forName(getDriverClass(dto.getDatabaseType()));

            try (java.sql.Connection conn = java.sql.DriverManager.getConnection(
                    jdbcUrl, dto.getUsername(), dto.getPassword())) {
                return conn.isValid(5);
            }
        } catch (Exception e) {
            return false;
        }
    }

    private String buildJdbcUrl(DatabaseConnectionDTO dto) {
        if (dto.getDatabaseType() == DatabaseType.POSTGRESQL) {
            return String.format("jdbc:postgresql://%s:%d/%s?sslmode=require",
                    dto.getHost(), dto.getPort(), dto.getDatabaseName());
        } else if (dto.getDatabaseType() == DatabaseType.MYSQL) {
            return String.format("jdbc:mysql://%s:%d/%s?useSSL=false&allowPublicKeyRetrieval=true",
                    dto.getHost(), dto.getPort(), dto.getDatabaseName());
        }
        throw new RuntimeException("Unsupported database type");
    }

    private String getDriverClass(DatabaseType type) {
        if (type == DatabaseType.POSTGRESQL) {
            return "org.postgresql.Driver";
        } else if (type == DatabaseType.MYSQL) {
            return "com.mysql.cj.jdbc.Driver";
        }
        throw new RuntimeException("Unsupported database type");
    }

    private DatabaseConnectionDTO toDTO(DatabaseConnectionEntity entity) {
        return DatabaseConnectionDTO.builder()
                .id(entity.getId())
                .accountId(entity.getAccount().getId())
                .name(entity.getName())
                .databaseType(entity.getDatabaseType())
                .host(entity.getHost())
                .port(entity.getPort())
                .databaseName(entity.getDatabaseName())
                .username(entity.getUsername())
                .password(entity.getPassword())
                .mode(entity.getMode())
                .isActive(entity.getIsActive())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
