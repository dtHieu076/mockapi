package com.mockapiproject.mockapi.Service.Impl;

import com.mockapiproject.mockapi.DTO.MockApiDTO;
import com.mockapiproject.mockapi.Entity.MockApiEntity;
import com.mockapiproject.mockapi.Entity.SubdomainEntity;
import com.mockapiproject.mockapi.Repository.MockApiRepository;
import com.mockapiproject.mockapi.Repository.SubdomainRepository;
import com.mockapiproject.mockapi.Service.MockApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MockApiServiceImpl implements MockApiService {

    private final MockApiRepository mockApiRepository;
    private final SubdomainRepository subdomainRepository;

    @Override
    public MockApiDTO create(UUID subdomainId, MockApiDTO dto) {
        SubdomainEntity subdomain = subdomainRepository.findById(subdomainId)
                .orElseThrow(() -> new RuntimeException("Subdomain not found"));

        MockApiEntity mockApi = MockApiEntity.builder()
                .subdomain(subdomain)
                .method(dto.getMethod())
                .path(dto.getPath())
                .statusCode(dto.getStatusCode() != null ? dto.getStatusCode() : 200)
                .responseBody(dto.getResponseBody())
                .build();

        MockApiEntity saved = mockApiRepository.save(mockApi);
        return toDTO(saved);
    }

    @Override
    public List<MockApiDTO> getBySubdomain(UUID subdomainId) {
        List<MockApiEntity> entities = mockApiRepository.findBySubdomainId(subdomainId);
        return entities.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public MockApiDTO update(UUID id, MockApiDTO dto) {
        MockApiEntity mockApi = mockApiRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("MockApi not found"));

        mockApi.setMethod(dto.getMethod());
        mockApi.setPath(dto.getPath());
        mockApi.setStatusCode(dto.getStatusCode() != null ? dto.getStatusCode() : 200);
        mockApi.setResponseBody(dto.getResponseBody());

        MockApiEntity saved = mockApiRepository.save(mockApi);
        return toDTO(saved);
    }

    @Override
    public void delete(UUID id) {
        if (!mockApiRepository.existsById(id)) {
            throw new RuntimeException("MockApi not found");
        }
        mockApiRepository.deleteById(id);
    }

    private MockApiDTO toDTO(MockApiEntity entity) {
        MockApiDTO dto = new MockApiDTO();
        dto.setId(entity.getId());
        dto.setMethod(entity.getMethod());
        dto.setPath(entity.getPath());
        dto.setStatusCode(entity.getStatusCode());
        dto.setResponseBody(entity.getResponseBody());
        return dto;
    }
}
