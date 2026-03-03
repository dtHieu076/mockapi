package com.mockapiproject.mockapi.Service;

import com.mockapiproject.mockapi.Entity.AccountEntity;

public interface AccountService {
    AccountEntity register(String username, String password);

    AccountEntity login(String username, String password);
}
