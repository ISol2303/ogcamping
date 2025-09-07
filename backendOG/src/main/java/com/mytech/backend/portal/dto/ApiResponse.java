package com.mytech.backend.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Class dùng để chuẩn hóa tất cả response trả về cho frontend
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private int status;
    private String message;
    private T data;
}
