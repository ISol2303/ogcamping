package com.mytech.backend.portal.dto;

import java.io.Serializable;

import com.mytech.backend.portal.models.User.Role;

import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SignInResponse implements Serializable {

	public class User {

		public void set_id(Long id) {
			// TODO Auto-generated method stub
			this.set_id(id);
		}

		public void setEmail(String email) {
			// TODO Auto-generated method stub
			this.setEmail(email);
			
		}

		public void setName(String name) {
			// TODO Auto-generated method stub
			this.setName(name);
		}

		public void setRole(String name) {
			// TODO Auto-generated method stub
			this.setRole(name);
		}

	}
	private static final long serialVersionUID = 1691310343751417289L;
	private String token;
	private String refreshToken;
	private String tokenType;
	private String fullname;
	private String email;
	private User user;
	@Enumerated(EnumType.STRING)
    @Column
    private Role role = Role.CUSTOMER;
	public String getToken() {
		return token;
	}
	public void setToken(String token) {
		this.token = token;
	}
	public String getRefreshToken() {
		return refreshToken;
	}
	public void setRefreshToken(String refreshToken) {
		this.refreshToken = refreshToken;
	}
	public String getTokenType() {
		return tokenType;
	}
	public void setTokenType(String tokenType) {
		this.tokenType = tokenType;
	}
	public String getFullname() {
		return fullname;
	}
	public void setFullname(String fullname) {
		this.fullname = fullname;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public static long getSerialversionuid() {
		return serialVersionUID;
	}
	public Role getRole() {
		return role;
	}
	public void setRole(Role role) {
		this.role = role;
	}
	public User getUser() {
		return user;
	}
	public void setUser(User user) {
		this.user = user;
	}

	
}
