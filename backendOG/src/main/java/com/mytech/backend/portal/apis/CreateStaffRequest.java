package com.mytech.backend.portal.apis;

import com.mytech.backend.portal.models.User;
import com.mytech.backend.portal.models.User.Status;
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
    private User.Status status; // Hoặc String nếu bạn muốn gửi text
    
	public CreateStaffRequest(String name, String email, String phone, String password, String department,
			LocalDate joinDate, Status status) {
		super();
		this.name = name;
		this.email = email;
		this.phone = phone;
		this.password = password;
		this.department = department;
		this.joinDate = joinDate;
		this.status = status;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getDepartment() {
		return department;
	}

	public void setDepartment(String department) {
		this.department = department;
	}

	public LocalDate getJoinDate() {
		return joinDate;
	}

	public void setJoinDate(LocalDate joinDate) {
		this.joinDate = joinDate;
	}

	public User.Status getStatus() {
		return status;
	}

	public void setStatus(User.Status status) {
		this.status = status;
	}
	
    
}
