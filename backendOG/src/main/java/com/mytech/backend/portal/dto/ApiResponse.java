package com.mytech.backend.portal.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Class dùng để chuẩn hóa tất cả response trả về cho frontend
 */
@Data
@NoArgsConstructor
public class ApiResponse<T> {
    private int status;
    private String message;
    private T data;


    public ApiResponse(int status, String message, T data) {
        super();
        this.status = status;
        this.message = message;
        this.data = data;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(200, "Success", data);
    }

    public static <T> ApiResponse<T> error(int status, String message) {
        return new ApiResponse<>(status, message, null);
    }
}
