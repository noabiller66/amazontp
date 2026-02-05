package com.example.demo.user.security;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@Component
public class AdminCodeGenerator {

    // Stocker les codes admin avec leur date d'expiration
    private Map<String, LocalDateTime> adminCodes = new HashMap<>();
    private static final int CODE_VALIDITY_MINUTES = 10; // Code valide pendant 10 minutes
    
    private Random random = new Random();

    // Générer un code admin unique (6 chiffres)
    public String generateAdminCode() {
        String code = String.format("%06d", random.nextInt(1000000));
        adminCodes.put(code, LocalDateTime.now().plusMinutes(CODE_VALIDITY_MINUTES));
        
        System.out.println("\n╔════════════════════════════════════════╗");
        System.out.println("║   🔐 CODE ADMIN GÉNÉRÉ                ║");
        System.out.println("╠════════════════════════════════════════╣");
        System.out.println("║   Code:  " + code + "                         ║");
        System.out.println("║   Valide pendant " + CODE_VALIDITY_MINUTES + " minutes            ║");
        System.out.println("╚════════════════════════════════════════╝\n");
        
        return code;
    }

    // Vérifier et valider un code admin
    public boolean validateAdminCode(String code) {
        if (!adminCodes.containsKey(code)) {
            System.out.println("❌ Code admin invalide: " + code);
            return false;
        }

        LocalDateTime expirationTime = adminCodes.get(code);
        if (LocalDateTime.now().isAfter(expirationTime)) {
            adminCodes.remove(code); // Supprimer le code expiré
            System.out.println("❌ Code admin expiré: " + code);
            return false;
        }

        // Code valide, on le supprime pour qu'il ne soit utilisable qu'une seule fois
        adminCodes.remove(code);
        System.out.println("✅ Code admin validé: " + code);
        return true;
    }

    // Nettoyer les codes expirés (optionnel, pour éviter l'accumulation)
    public void cleanExpiredCodes() {
        LocalDateTime now = LocalDateTime.now();
        adminCodes.entrySet().removeIf(entry -> now.isAfter(entry.getValue()));
    }
}
