package com.mockapiproject.mockapi.Service.Impl;

import com.mockapiproject.mockapi.Entity.AccountEntity;
import com.mockapiproject.mockapi.Repository.AccountRepository;
import com.mockapiproject.mockapi.Service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;

    @Override
    public AccountEntity register(String username, String password) {
        Optional<AccountEntity> existingAccount = accountRepository.findByUsername(username);
        if (existingAccount.isPresent()) {
            throw new RuntimeException("Username already exists");
        }

        AccountEntity account = AccountEntity.builder()
                .username(username)
                .password(password)
                .build();

        return accountRepository.save(account);
    }

    @Override
    public AccountEntity login(String username, String password) {
        AccountEntity account = accountRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (!account.getPassword().equals(password)) {
            throw new RuntimeException("Invalid password");
        }

        return account;
    }
}
