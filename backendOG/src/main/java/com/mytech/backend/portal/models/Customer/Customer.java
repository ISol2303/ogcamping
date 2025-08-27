package com.mytech.backend.portal.models.Customer;
import java.util.ArrayList;
import java.util.List;

import com.mytech.backend.portal.models.User;
import com.mytech.backend.portal.models.Booking.Booking;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @NotBlank
    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Email
    @NotBlank
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = true, unique = true)
    private String phone;

    private String address;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Booking> bookings = new ArrayList<>();

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

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public List<Booking> getBookings() {
		return bookings;
	}

	public void setBookings(List<Booking> bookings) {
		this.bookings = bookings;
	}

	 public static class Builder {
		    private Long id;
		    private String firstName;
		    private String lastName;
		    private String email;
		    private String phone;
		    private String address;
		    private User user;
		    private List<Booking> bookings = new ArrayList<>();
		    
		    public Builder id(Long id) {
	            this.id = id;
	            return this;
	        }
		    public Builder firstName(String firstName) {
	            this.firstName = firstName;
	            return this;
	        }
		    public Builder lastName(String lastName) {
	            this.lastName = lastName;
	            return this;
	        }
		    public Builder email(String email) {
	            this.email = email;
	            return this;
	        }
		    public Builder phone(String phone) {
	            this.phone = phone;
	            return this;
	        }
		    public Builder address(String address) {
	            this.address = address;
	            return this;
	        }
		    public Builder user(User user) {
	            this.user = user;
	            return this;
	        }
		    public Builder bookings(List<Booking> bookings) {
	            this.bookings = bookings;
	            return this;
	        }
		    public Customer build() {
	            Customer customer = new Customer();
	            customer.id = this.id;
	            customer.firstName = this.firstName;
	            customer.lastName = this.lastName;
	            customer.email = this.email;
	            customer.phone = this.phone;
	            customer.address = this.address;
	            customer.user = this.user;
	            customer.bookings = this.bookings;
	            return customer;
	        }
	}
	 public static Builder builder() {
	        return new Builder();
	    }
}

