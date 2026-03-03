package com.mockapiproject.mockapi.Service;

import com.mockapiproject.mockapi.DTO.SubdomainDTO;
import com.mockapiproject.mockapi.Entity.SubdomainEntity;

import java.util.List;
import java.util.UUID;

public interface SubdomainService {
    SubdomainDTO create(UUID accountId, String name);

    List<SubdomainDTO> getByAccount(UUID accountId);

    SubdomainDTO update(UUID id, String name);

    void delete(UUID id);
}
