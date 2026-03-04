package com.mockapiproject.mockapi.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TableDTO {
    private String name;
    private String schema;
    private Long rowCount;
    private List<ColumnDTO> columns;
}
