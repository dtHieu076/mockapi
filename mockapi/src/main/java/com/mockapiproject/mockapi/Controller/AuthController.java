package com.mockapiproject.mockapi.Controller;

import com.mockapiproject.mockapi.DTO.AccountRequest;
import com.mockapiproject.mockapi.Entity.AccountEntity;
import com.mockapiproject.mockapi.Service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AccountService accountService;

    @PostMapping("/register")
    public AccountEntity register(@RequestBody AccountRequest account) {
        return accountService.register(account.getUsername(), account.getPassword());
    }

    @PostMapping("/login")
    public AccountEntity login(@RequestBody AccountRequest account) {
        return accountService.login(account.getUsername(), account.getPassword());
    }

    @GetMapping("/test")
    public String test() {
        return "Auth API is working!";
    }
}
