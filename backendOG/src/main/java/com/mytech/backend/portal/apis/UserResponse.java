package com.mytech.backend.portal.apis;

public class UserResponse {

	private Long id;
	private String name;
	private String email;
	private String role;
	
	public UserResponse(Long id, String name, String email, String role) {
		// TODO Auto-generated constructor stub
		this.id = id;
		this.email = email;
		this.name = name;
		this.role = role;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
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

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

}
