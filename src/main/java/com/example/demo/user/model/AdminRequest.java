package com.example.demo.user.model;

import java.time.LocalDateTime;

public class AdminRequest {
    
    private String email;
    private LocalDateTime requestDate;
    private String status; // PENDING, APPROVED, REJECTED

    public AdminRequest(String email) {
        this.email = email;
        this.requestDate = LocalDateTime.now();
        this.status = "PENDING";
    }

    public String getEmail() {
        return email;
    }

    public LocalDateTime getRequestDate() {
        return requestDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
