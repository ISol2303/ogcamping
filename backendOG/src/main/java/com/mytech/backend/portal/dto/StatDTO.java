package com.mytech.backend.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatDTO {
    private String title;
    private String value;
    private String icon;
    private String color;
    private String change;
    
}