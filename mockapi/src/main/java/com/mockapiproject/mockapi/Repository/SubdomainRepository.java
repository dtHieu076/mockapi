package com.mockapiproject.mockapi.Repository;

import com.mockapiproject.mockapi.Entity.SubdomainEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubdomainRepository extends JpaRepository<SubdomainEntity, UUID> {
    List<SubdomainEntity> findByAccountId(UUID accountId);

    Optional<SubdomainEntity> findByFullDomain(String fullDomain);

    Optional<SubdomainEntity> findByName(String name);
}
