package com.mockapiproject.mockapi.DTO;

import lombok.Data;

import java.util.UUID;

@Data
public class SubdomainDTO {
    private UUID id;
    private String name;
    private String fullDomain;
}
