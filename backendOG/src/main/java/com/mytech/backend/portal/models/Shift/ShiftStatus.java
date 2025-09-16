package com.mytech.backend.portal.models.Shift;

public enum ShiftStatus {
    REGISTERED,  // Nhân viên đăng ký
    APPROVED,    // Quản lý duyệt
    IN_PROGRESS, // Đang trực
    COMPLETED,   // Đã xong
    CANCELLED    // Bị hủy
}
