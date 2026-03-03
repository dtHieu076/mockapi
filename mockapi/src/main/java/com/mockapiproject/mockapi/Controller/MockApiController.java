package com.mockapiproject.mockapi.Controller;

import com.mockapiproject.mockapi.DTO.MockApiDTO;
import com.mockapiproject.mockapi.Service.MockApiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/apis")
@RequiredArgsConstructor
public class MockApiController {

    private final MockApiService mockApiService;

    @PostMapping("/{subdomainId}")
    public MockApiDTO create(@PathVariable UUID subdomainId,
            @RequestBody MockApiDTO dto) {
        return mockApiService.create(subdomainId, dto);
    }

    @GetMapping("/{subdomainId}")
    public List<MockApiDTO> list(@PathVariable UUID subdomainId) {
        return mockApiService.getBySubdomain(subdomainId);
    }

    @PutMapping("/{id}")
    public MockApiDTO update(@PathVariable UUID id, @RequestBody MockApiDTO dto) {
        return mockApiService.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        mockApiService.delete(id);
    }
}
