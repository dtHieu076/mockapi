package com.mockapiproject.mockapi.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ColumnDTO {
    private String name;
    private String type;
    private String typeGeneric;
    private Integer size;
    private Integer precision;
    private Integer scale;
    private Boolean isNullable;
    private Boolean isPrimaryKey;
    private Boolean isAutoIncrement;
    private String defaultValue;
    private String comment;
}
