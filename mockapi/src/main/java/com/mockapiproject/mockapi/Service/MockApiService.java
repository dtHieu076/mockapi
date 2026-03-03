package com.mockapiproject.mockapi.Service;

import com.mockapiproject.mockapi.DTO.MockApiDTO;

import java.util.List;
import java.util.UUID;

public interface MockApiService {
    MockApiDTO create(UUID subdomainId, MockApiDTO dto);

    List<MockApiDTO> getBySubdomain(UUID subdomainId);

    MockApiDTO update(UUID id, MockApiDTO dto);

    void delete(UUID id);
}
