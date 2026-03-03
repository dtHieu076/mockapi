package com.mockapiproject.mockapi.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateSubdomainRequest {
    @NotBlank
    private String name;
}
