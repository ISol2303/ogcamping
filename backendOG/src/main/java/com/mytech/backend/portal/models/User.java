package com.mytech.backend.portal.models;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @NotBlank
    @Email
    @Column(nullable = false, unique = true)
    private String email;

//    @NotBlank
    @Column(name = "password", nullable = false)
    private String password;

//    @NotBlank
    @Column(nullable = false)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column
    private Role role = Role.GUEST;

    @Column
    private String department;

    @Column(name = "join_date")
    private String joinDate;

    @Enumerated(EnumType.STRING)
    @Column
    private Status status = Status.ACTIVE;

    @Column(name = "agree_marketing")
    private Boolean agreeMarketing = false;
    
    private String avatar; 

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    // ✅ Phương thức builder
    public static Builder builder() {
        return new Builder();
    }

    // ✅ Inner static Builder class
    public static class Builder {
        private final User user;

        public Builder() {
            user = new User();
        }

        public Builder name(String name) {
            user.name = name;
            return this;
        }

        public Builder email(String email) {
            user.email = email;
            return this;
        }

        public Builder password(String password) {
            user.password = password;
            return this;
        }

        public Builder phone(String phone) {
            user.phone = phone;
            return this;
        }

        public Builder role(Role role) {
            user.role = role;
            return this;
        }

        public Builder department(String department) {
            user.department = department;
            return this;
        }

        public Builder joinDate(String joinDate) {
            user.joinDate = joinDate;
            return this;
        }

        public Builder status(Status status) {
            user.status = status;
            return this;
        }

        public Builder agreeMarketing(Boolean agreeMarketing) {
            user.agreeMarketing = agreeMarketing;
            return this;
        }

        public User build() {
            return user;
        }

		public Builder createdAt(LocalDateTime now) {
			user.createdAt = now;
	        return this;
		}
    }

    // Getters, setters nếu không dùng Lombok (@Getter, @Setter)
    public enum Role {
        CUSTOMER, STAFF, ADMIN, GUEST
    }

    public enum Status {
        ACTIVE, INACTIVE
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

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	public String getDepartment() {
		return department;
	}

	public void setDepartment(String department) {
		this.department = department;
	}

	public String getJoinDate() {
		return joinDate;
	}

	public void setJoinDate(String joinDate) {
		this.joinDate = joinDate;
	}

	public Status getStatus() {
		return status;
	}

	public void setStatus(Status status) {
		this.status = status;
	}

	public Boolean getAgreeMarketing() {
		return agreeMarketing;
	}

	public void setAgreeMarketing(Boolean agreeMarketing) {
		this.agreeMarketing = agreeMarketing;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public String getAvatar() {
		return avatar;
	}

	public void setAvatar(String avatar) {
		this.avatar = avatar;
	}
    
}