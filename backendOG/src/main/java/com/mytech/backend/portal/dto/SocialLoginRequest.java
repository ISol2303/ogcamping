package com.mytech.backend.portal.dto;

public class SocialLoginRequest {
    private String idToken;
    private String provider; // "google" | "facebook"

    public String getIdToken() { return idToken; }
    public void setIdToken(String idToken) { this.idToken = idToken; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
}
