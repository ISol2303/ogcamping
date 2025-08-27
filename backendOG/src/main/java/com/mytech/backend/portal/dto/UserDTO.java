package com.mytech.backend.portal.dto;

import com.mytech.backend.portal.models.User;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
	private Long id;
	private String firstName;
	private String lastName;
    private String name;
    private String email;
    private User.Role role;
    private String avatar;
    private String password;
    private String phone;
    private String department;
    private LocalDate joinDate;
    private String status;
    private Boolean agreeMarketing;
	private String address;
	private LocalDateTime CreatedAt;
	
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getFirstName() {
		return firstName;
	}
	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
	public String getLastName() {
		return lastName;
	}
	public void setLastName(String lastName) {
		this.lastName = lastName;
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
	public User.Role getRole() {
		return role;
	}
	public void setRole(User.Role role) {
		this.role = role;
	}
	public String getAvatar() {
		return avatar;
	}
	public void setAvatar(String avatar) {
		this.avatar = avatar;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public String getPhone() {
		return phone;
	}
	public void setPhone(String phone) {
		this.phone = phone;
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
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public Boolean getAgreeMarketing() {
		return agreeMarketing;
	}
	public void setAgreeMarketing(Boolean agreeMarketing) {
		this.agreeMarketing = agreeMarketing;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public LocalDateTime getCreatedAt() {
		return CreatedAt;
	}
	public void setCreatedAt(LocalDateTime createdAt) {
		CreatedAt = createdAt;
	}
	
    
}
