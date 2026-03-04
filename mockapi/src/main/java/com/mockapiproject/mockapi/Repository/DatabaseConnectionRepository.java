package com.mockapiproject.mockapi.Repository;

import com.mockapiproject.mockapi.Entity.DatabaseConnectionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DatabaseConnectionRepository extends JpaRepository<DatabaseConnectionEntity, UUID> {
    List<DatabaseConnectionEntity> findByAccountId(UUID accountId);

    List<DatabaseConnectionEntity> findByAccountIdAndIsActiveTrue(UUID accountId);
}
