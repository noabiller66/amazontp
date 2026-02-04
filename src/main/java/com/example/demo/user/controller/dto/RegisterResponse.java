package com.example.demo.user.controller.dto;

public class RegisterResponse {
    private Long id;
    private String email;
    private String salt; // Le salt à renvoyer au frontend

    public RegisterResponse(Long id, String email, String salt) {
        this.id = id;
        this.email = email;
        this.salt = salt;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getSalt() {
        return salt;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setSalt(String salt) {
        this.salt = salt;
    }
}
