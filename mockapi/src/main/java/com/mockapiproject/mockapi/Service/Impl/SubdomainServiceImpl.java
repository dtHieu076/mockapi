package com.mockapiproject.mockapi.Service.Impl;

import com.mockapiproject.mockapi.DTO.SubdomainDTO;
import com.mockapiproject.mockapi.Entity.AccountEntity;
import com.mockapiproject.mockapi.Entity.SubdomainEntity;
import com.mockapiproject.mockapi.Repository.AccountRepository;
import com.mockapiproject.mockapi.Repository.SubdomainRepository;
import com.mockapiproject.mockapi.Service.SubdomainService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubdomainServiceImpl implements SubdomainService {

    private final SubdomainRepository subdomainRepository;
    private final AccountRepository accountRepository;

    @Override
    public SubdomainDTO create(UUID accountId, String name) {
        AccountEntity account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        String fullDomain = name + ".mockapi.dev";

        SubdomainEntity subdomain = SubdomainEntity.builder()
                .account(account)
                .name(name)
                .fullDomain(fullDomain)
                .build();

        SubdomainEntity saved = subdomainRepository.save(subdomain);
        return toDTO(saved);
    }

    @Override
    public List<SubdomainDTO> getByAccount(UUID accountId) {
        List<SubdomainEntity> entities = subdomainRepository.findByAccountId(accountId);
        return entities.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public SubdomainDTO update(UUID id, String name) {
        SubdomainEntity subdomain = subdomainRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subdomain not found"));

        subdomain.setName(name);
        subdomain.setFullDomain(name + ".mockapi.dev");

        SubdomainEntity saved = subdomainRepository.save(subdomain);
        return toDTO(saved);
    }

    @Override
    public void delete(UUID id) {
        if (!subdomainRepository.existsById(id)) {
            throw new RuntimeException("Subdomain not found");
        }
        subdomainRepository.deleteById(id);
    }

    private SubdomainDTO toDTO(SubdomainEntity entity) {
        SubdomainDTO dto = new SubdomainDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setFullDomain(entity.getFullDomain());
        return dto;
    }
}
