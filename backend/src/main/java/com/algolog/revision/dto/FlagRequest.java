package com.algolog.revision.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlagRequest {

    @JsonProperty("isFlagged")
    private boolean isFlagged;
    private String flaggedNote;
}
