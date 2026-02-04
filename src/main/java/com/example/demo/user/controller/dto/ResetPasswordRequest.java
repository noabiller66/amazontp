package com.example.demo.user.controller.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class ResetPasswordRequest {
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit être valide")
    private String email;

    @NotBlank(message = "Le code de vérification est obligatoire")
    private String code;

    @NotBlank(message = "Le nouveau mot de passe est obligatoire")
    private String newPassword;

    @NotBlank(message = "Le salt est obligatoire")
    private String salt;

    // Constructeur par défaut nécessaire pour Jackson (désérialisation JSON)
    public ResetPasswordRequest() {}

    public ResetPasswordRequest(String email, String code, String newPassword, String salt) {
        this.email = email;
        this.code = code;
        this.newPassword = newPassword;
        this.salt = salt;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCode() {
        System.out.println("Getting code: " + code);
        return code;

    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }

    public String getSalt() {
        return salt;
    }

    public void setSalt(String salt) {
        this.salt = salt;
    }
}
