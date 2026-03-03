package com.mockapiproject.mockapi.DTO;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AccountRequest {
    private String username;
    private String password;
}
