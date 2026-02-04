package com.example.demo.user.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", e.getMessage());
        error.put("status", "error");
        
        // Si l'erreur contient "existe déjà", renvoie 409 Conflict
        if (e.getMessage().contains("existe déjà")) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
        }
        
        // Sinon, renvoie 400 Bad Request
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
