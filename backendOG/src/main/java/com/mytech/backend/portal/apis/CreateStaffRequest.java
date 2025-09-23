// com/mytech/backend/portal/apis/CreateStaffRequest.java
package com.mytech.backend.portal.apis;

import java.time.LocalDate;

import com.mytech.backend.portal.models.User.User;
import com.mytech.backend.portal.models.User.User.Status;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateStaffRequest {
    private String name;
    private String email;
    private String phone;
    private String password;
    private String department;
    private LocalDate joinDate;
    private String status;

    // Getters and Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public LocalDate getJoinDate() { return joinDate; }
    public void setJoinDate(LocalDate joinDate) { this.joinDate = joinDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
