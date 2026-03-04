package com.mockapiproject.mockapi.DTO;

import com.mockapiproject.mockapi.Enum.DatabaseMode;
import com.mockapiproject.mockapi.Enum.DatabaseType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DatabaseConnectionDTO {
    private UUID id;
    private UUID accountId;
    private String name;
    private DatabaseType databaseType;
    private String host;
    private Integer port;
    private String databaseName;
    private String username;
    private String password;
    private DatabaseMode mode;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
