package com.algolog.category.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserCategoryDto {

    private UUID id;
    private String name;
    private String colorHex;
    private Integer sortOrder;
}
