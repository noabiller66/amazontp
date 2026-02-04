package com.example.demo.user.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class PasswordHasher {

    private final SecureRandom random = new SecureRandom();

    @Value("${app.security.pepper}")
    private String PEPPER;

    public String generateSalt() {
        byte[] salt = new byte[16];
        random.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    public String hashPassword(String password, String salt) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String saltedPassword = password + salt;
            byte[] hash = digest.digest(saltedPassword.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Erreur lors du hashing du mot de passe", e);
        }
    }

    public String addPepperToHash(String hashedPasswordFromFrontend) {
        try {
            System.err.println("🔍 VÉRIFICATION DU POIVRAGE:");
            System.err.println("   1️⃣ Hash reçu du frontend (password + salt): " + hashedPasswordFromFrontend);
            System.err.println("   2️⃣ PEPPER utilisé: " + PEPPER);
            
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            String pepperedHash = hashedPasswordFromFrontend + PEPPER;
            System.err.println("   3️⃣ Combinaison avant hash: " + pepperedHash);
            
            byte[] hash = digest.digest(pepperedHash.getBytes(StandardCharsets.UTF_8));
            
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            
            String finalHash = hexString.toString();
            System.err.println("   4️⃣ Hash FINAL (avec pepper): " + finalHash);
            System.err.println("   ✅ Le hash est différent du hash initial = PEPPER APPLIQUÉ!");
            
            return finalHash;
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Erreur lors du hashing du mot de passe", e);
        }
    }
}
