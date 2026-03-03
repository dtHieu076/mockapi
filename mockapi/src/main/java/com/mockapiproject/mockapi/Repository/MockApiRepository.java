package com.mockapiproject.mockapi.Repository;

import com.mockapiproject.mockapi.Entity.MockApiEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MockApiRepository extends JpaRepository<MockApiEntity, UUID> {
    List<MockApiEntity> findBySubdomainId(UUID subdomainId);

    Optional<MockApiEntity> findBySubdomainIdAndMethodAndPath(UUID subdomainId, String method, String path);
}
