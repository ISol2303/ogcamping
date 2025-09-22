package com.mytech.backend.portal.dto.Shift;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterShiftRequest {
    private Long staffId; // nếu staff tự đăng ký thì null -> lấy current user
}
