package com.mockapiproject.mockapi.Controller;

import com.mockapiproject.mockapi.DTO.CreateSubdomainRequest;
import com.mockapiproject.mockapi.DTO.SubdomainDTO;
import com.mockapiproject.mockapi.Service.SubdomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/subdomains")
@RequiredArgsConstructor
public class SubdomainController {

    private final SubdomainService subdomainService;

    @PostMapping("/{accountId}")
    public SubdomainDTO create(@PathVariable UUID accountId,
            @RequestBody CreateSubdomainRequest request) {
        return subdomainService.create(accountId, request.getName());
    }

    @GetMapping("/{accountId}")
    public List<SubdomainDTO> list(@PathVariable UUID accountId) {
        return subdomainService.getByAccount(accountId);
    }

    @PutMapping("/{id}")
    public SubdomainDTO update(@PathVariable UUID id, @RequestBody CreateSubdomainRequest request) {
        return subdomainService.update(id, request.getName());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        subdomainService.delete(id);
    }
}
