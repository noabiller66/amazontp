package com.example.demo.user.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateUserNameRequest {

    @NotNull
    private Long id;

    @NotBlank
    @Size(min = 2, max = 50)
    private String name;

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}