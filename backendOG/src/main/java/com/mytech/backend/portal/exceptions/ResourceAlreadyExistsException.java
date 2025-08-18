package com.mytech.backend.portal.exceptions;

public class ResourceAlreadyExistsException extends RuntimeException {
    /**
	 * 
	 */
	private static final long serialVersionUID = -5637696419512655343L;

	public ResourceAlreadyExistsException(String message) {
        super(message);
    }
}