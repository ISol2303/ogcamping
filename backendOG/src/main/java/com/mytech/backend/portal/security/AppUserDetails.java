package com.mytech.backend.portal.security;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.mytech.backend.portal.models.User;

public class AppUserDetails implements UserDetails {

    private static final long serialVersionUID = 995564934432043084L;
    @Autowired
    private User user;
    
    public AppUserDetails(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> listAuthorities = new ArrayList<>();
        String role = user.getRole() != null ? user.getRole().name().toUpperCase() : "ROLE_CUSTOMER";
        listAuthorities.add(new SimpleGrantedAuthority(role));
        System.out.println("Authorities for " + user.getEmail() + ": " + listAuthorities);
        return listAuthorities;
    }


    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public List<String> roles() {
        String role = user.getRole() != null ? user.getRole().name().toUpperCase() : "ROLE_CUSTOMER";
        List<String> roles = Collections.singletonList(role);
        System.out.println("Roles for " + user.getEmail() + ": " + roles);
        return roles;
    }


    public String getFullname() {
        return user.getName();
    }
}