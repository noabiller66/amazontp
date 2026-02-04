package com.example.demo.user.security;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Component
public class CodeGenerator {

    private final SecureRandom random = new SecureRandom();
    private final Map<String, Map<String, Object>> resetCodes = new HashMap<>();

    public String generateCode() {
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }

    public void storeResetCode(String email, String code) {
        Map<String, Object> codeData = new HashMap<>();
        codeData.put("code", code);
        codeData.put("expiry", LocalDateTime.now().plusMinutes(5));
        resetCodes.put(email, codeData);
        
        displayCodeInConsole(email, code);
    }

    public boolean verifyResetCode(String email, String code) {
        if (!resetCodes.containsKey(email)) {
            return false;
        }

        Map<String, Object> codeData = resetCodes.get(email);
        String storedCode = (String) codeData.get("code");
        LocalDateTime expiry = (LocalDateTime) codeData.get("expiry");

        if (LocalDateTime.now().isAfter(expiry)) {
            resetCodes.remove(email);
            return false;
        }

        return storedCode.equals(code);
    }

    public void removeResetCode(String email) {
        resetCodes.remove(email);
    }

    private void displayCodeInConsole(String email, String code) {
        System.err.println("\n");
        System.err.println("╔════════════════════════════════════════╗");
        System.err.println("║   📧 CODE A2F - MOT DE PASSE OUBLIÉ   ║");
        System.err.println("╠════════════════════════════════════════╣");
        System.err.println("║   Email: " + email);
        System.err.println("║   Code:  " + code);
        System.err.println("║   Expire dans 5 minutes                ║");
        System.err.println("╚════════════════════════════════════════╝");
        System.err.println("\n");
    }
}
