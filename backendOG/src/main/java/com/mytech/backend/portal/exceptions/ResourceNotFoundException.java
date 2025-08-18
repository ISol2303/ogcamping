package com.mytech.backend.portal.exceptions;

public class ResourceNotFoundException extends RuntimeException {
    /**
	 * 
	 */
	private static final long serialVersionUID = -2268523905195880901L;

	public ResourceNotFoundException(String message) {
        super(message);
    }
}
