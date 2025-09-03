package com.mytech.backend.portal.models;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users")
@Getter
@Setter
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


    // Bỏ @NotBlank để login Google không lỗi
    @Column(nullable = true)
    private String password;

    @Column(nullable = true)
  
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    private String department;

    @Column(name = "join_date")
    private LocalDate joinDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Column(name = "agree_marketing", nullable = false)
    private Boolean agreeMarketing;

    private String avatar;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now(); // Default to current timestamp

    @PrePersist
    public void prePersist() {
        if (role == null) role = Role.CUSTOMER;
        if (status == null) status = Status.ACTIVE;
        if (agreeMarketing == null) agreeMarketing = false;
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Customer customer;

    public enum Role {
        CUSTOMER, STAFF, ADMIN
    }

    public enum Status {
        ACTIVE, INACTIVE
    }
    @Column(name = "google_Id", nullable = true)
    private String googleId;
    
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
	public LocalDate getJoinDate() {
		return joinDate;
	}
	public void setJoinDate(LocalDate joinDate) {
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
	public String getAvatar() {
		return avatar;
	}
	public void setAvatar(String avatar) {
		this.avatar = avatar;
	}
	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
	public Customer getCustomer() {
		return customer;
	}
	public void setCustomer(Customer customer) {
		this.customer = customer;
	}
	public String getGoogleId() {
		return googleId;
	}
	public void setGoogleId(String googleId) {
		this.googleId = googleId;
	}
	// ... other fields and methods ...

    public static class Builder {
        private Long id;
        private String name;
        private String email;
        private String password;
        private String phone;
        private Role role;
        private String department;
        private LocalDate joinDate;
        private Status status;
        private Boolean agreeMarketing;
        private String avatar;
        private LocalDateTime createdAt;
        private Customer customer;
        private String googleId;
        
        public Builder googleId(String googleId) {
            this.googleId = googleId;
            return this;
        }
        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }
        public Builder password(String password) {
            this.password = password;
            return this;
        }
        public Builder agreeMarketing(Boolean agreeMarketing) {
            this.agreeMarketing = agreeMarketing;
            return this;
        }
        public Builder avatar(String avatar) {
            this.avatar = avatar;
            return this;
        }
        public Builder role(Role role) {
            this.role = role;
            return this;
        }
        public Builder status(Status status) {
            this.status = status;
            return this;
        }
        public Builder joinDate(LocalDate joinDate) {
            this.joinDate = joinDate;
            return this;
        }
        public Builder department(String department) {
            this.department = department;
            return this;
        }
        public Builder phone(String phone) {
            this.phone = phone;
            return this;
        }
        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }
        public Builder customer(Customer customer) {
            this.customer = customer;
            return this;
        }
        // ... other builder methods ...

        public User build() {
            User user = new User();
            user.id = this.id;
            user.name = this.name;
            user.email = this.email;
            user.password = this.password;
            user.phone = this.phone;
            user.role = this.role != null ? this.role : Role.CUSTOMER;
            user.department = this.department;
            user.joinDate = this.joinDate;
            user.status = this.status != null ? this.status : Status.ACTIVE;
            user.agreeMarketing = this.agreeMarketing != null ? this.agreeMarketing : false;
            user.avatar = this.avatar;
            user.createdAt = this.createdAt != null ? this.createdAt : LocalDateTime.now();
            user.customer = this.customer;
            user.googleId = this.googleId;
            return user;
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}