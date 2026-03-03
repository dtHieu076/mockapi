package com.mockapiproject.mockapi.DTO;

import lombok.Data;

import java.util.UUID;

@Data
public class MockApiDTO {
    private UUID id;
    private String method;
    private String path;
    private Integer statusCode;
    private String responseBody;
}
