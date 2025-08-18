package com.mytech.backend.portal.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
	private Long id;
    private String name;
    private String email;
    private String role;
    private String avatar;
    private String password;
    private String phone;
    private String department;
    private LocalDate joinDate;
    private String status;
    private Boolean agreeMarketing;
    
    
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
	public String getRole() {
		return role;
	}
	public void setRole(String role) {
		this.role = role;
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
	
	public String getAvatar() {
		return avatar;
	}
	public void setAvatar(String avatar) {
		this.avatar = avatar;
	}

	// ✅ Builder thủ công
    public static class Builder {
        private final UserDTO userDTO;

        public Builder() {
            userDTO = new UserDTO();
        }

        public Builder id(Long id) {
            userDTO.setId(id);
            return this;
        }

        public Builder name(String name) {
            userDTO.setName(name);
            return this;
        }

        public Builder email(String email) {
            userDTO.setEmail(email);
            return this;
        }

        public Builder password(String password) {
            userDTO.setPassword(password);
            return this;
        }

        public Builder phone(String phone) {
            userDTO.setPhone(phone);
            return this;
        }

        public Builder role(String role) {
            userDTO.setRole(role);
            return this;
        }

        public Builder department(String department) {
            userDTO.setDepartment(department);
            return this;
        }

        public Builder joinDate(LocalDate joinDate) {
            userDTO.setJoinDate(joinDate);
            return this;
        }

        public Builder status(String status) {
            userDTO.setStatus(status);
            return this;
        }

        public Builder agreeMarketing(Boolean agreeMarketing) {
            userDTO.setAgreeMarketing(agreeMarketing);
            return this;
        }
        public Builder avartar(String avartar) {
        	userDTO.setAvatar(avartar);
        	return this;
        }

        public UserDTO build() {
            return userDTO;
        }
    }

    public static Builder builder() {
        return new Builder();
    }

    
}
