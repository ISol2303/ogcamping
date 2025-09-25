package com.mytech.backend.portal.security;

import com.mytech.backend.portal.models.User.User;
import com.mytech.backend.portal.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AppUserDetailsService implements UserDetailsService {
	
	@Autowired
	private UserService userService;

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
	    User user = userService.findByEmail(username);
	    if (user == null) {
	        throw new UsernameNotFoundException("User not found with email: " + username);
	    }
	    return new AppUserDetails(user);
	}
	
	

}
