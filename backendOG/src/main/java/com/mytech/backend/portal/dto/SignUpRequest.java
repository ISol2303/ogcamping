package com.mytech.backend.portal.dto;

import lombok.Data;

@Data
public class SignUpRequest {
    private String name;
    private String email;
    private String phone;
    private String password;
    private Boolean agreeMarketing;
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
	public Boolean getAgreeMarketing() {
		return agreeMarketing;
	}
	public void setAgreeMarketing(Boolean agreeMarketing) {
		this.agreeMarketing = agreeMarketing;
	}
    
}
