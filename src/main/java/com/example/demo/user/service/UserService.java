package com.example.demo.user.service;

import com.example.demo.user.model.User;
import com.example.demo.user.repository.UserRepository;
import com.example.demo.user.security.PasswordHasher;
import com.example.demo.user.security.CodeGenerator;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordHasher passwordHasher;
    private final CodeGenerator codeGenerator;

    public UserService(UserRepository userRepository, PasswordHasher passwordHasher, CodeGenerator codeGenerator) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.codeGenerator = codeGenerator;
    }

    public List<User> getUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public String generateSalt() {
        return passwordHasher.generateSalt();
    }

    public Optional<String> getSaltByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(User::getSalt);
    }

    public User registerUser(String email, String hashedPasswordFromFrontend, String salt) {
        System.err.println("\n📝 INSCRIPTION - DÉBUT");
        System.err.println("   Email: " + email);
        
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent()) {
            System.err.println("   ❌ ERREUR: Email déjà utilisé!");
            System.err.println("📝 INSCRIPTION - FIN\n");
            throw new RuntimeException("Un compte existe déjà avec cet email : " + email);
        }
        
        System.err.println("   ✅ Email disponible");
        System.err.println("   Salt: " + salt);
        
        // Le frontend a déjà haché (password + salt)
        // On ajoute le PEPPER et on hache à nouveau
        String finalHash = passwordHasher.addPepperToHash(hashedPasswordFromFrontend);
        
        System.err.println("   Hash stocké en base: " + finalHash);
        System.err.println("📝 INSCRIPTION - FIN\n");
        
        User newUser = new User(email, finalHash, salt);
        return userRepository.addUser(newUser);
    }

    public Optional<User> loginUser(String email, String hashedPasswordFromFrontend) {
        System.err.println("\n🔑 CONNEXION - DÉBUT");
        System.err.println("   Email: " + email);
        
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Trouve l'utilisateur par email
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            System.err.println("   Hash stocké en base: " + user.getPass());
            
            String finalHash = passwordHasher.addPepperToHash(hashedPasswordFromFrontend);
            
            System.err.println("   Hash calculé pour comparaison: " + finalHash);
            
            if (user.getPass().equals(finalHash)) {
                System.err.println("   ✅ MATCH! Connexion réussie");
                System.err.println("🔑 CONNEXION - FIN\n");
                return userOpt;
            } else {
                System.err.println("   ❌ PAS DE MATCH! Mot de passe incorrect");
                System.err.println("🔑 CONNEXION - FIN\n");
            }
        } else {
            System.err.println("   ❌ Utilisateur non trouvé");
            System.err.println("🔑 CONNEXION - FIN\n");
        }
        
        return Optional.empty();
    }

    public String requestPasswordReset(String email) {
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            System.err.println("⚠️ Tentative de réinitialisation pour email inexistant: " + email);
            System.err.println("   → Aucun code généré (mais l'utilisateur ne le saura pas)");
            return "";
        }

        String code = codeGenerator.generateCode();
        codeGenerator.storeResetCode(email, code);
        
        return code;
    }
    public boolean verifyResetCode(String email, String code) {
        System.err.println("\n🔍 VÉRIFICATION DU CODE A2F (Reset Password)");
        System.err.println("   Email: " + email);
        System.err.println("   Code fourni: " + code);

        // PROTECTION ANTI-BRUTE FORCE : Délai de 1 seconde
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        boolean isValid = codeGenerator.verifyResetCode(email, code);
        
        if (isValid) {
            System.err.println("   ✅ Code valide!");
        } else {
            System.err.println("   ❌ Code invalide ou expiré");
        }
        
        return isValid;
    }

    public Optional<User> resetPassword(String email, String code, String newHashedPassword, String newSalt) {
        System.err.println("\n🔄 RÉINITIALISATION DU MOT DE PASSE - DÉBUT");
        System.err.println("   Email: " + email);

        if (!codeGenerator.verifyResetCode(email, code)) {
            System.err.println("   ❌ Code A2F invalide ou expiré");
            System.err.println("🔄 RÉINITIALISATION - FIN\n");
            return Optional.empty();
        }

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            System.err.println("   ❌ Utilisateur non trouvé");
            System.err.println("🔄 RÉINITIALISATION - FIN\n");
            return Optional.empty();
        }

        User user = userOpt.get();

        String finalHash = passwordHasher.addPepperToHash(newHashedPassword);

        System.err.println("   Nouveau salt: " + newSalt);
        System.err.println("   Nouveau hash stocké: " + finalHash);

        User updatedUser = new User(email, finalHash, newSalt);
        userRepository.replaceUser(user, updatedUser);

        codeGenerator.removeResetCode(email);

        System.err.println("   ✅ Mot de passe réinitialisé avec succès!");
        System.err.println("🔄 RÉINITIALISATION - FIN\n");

        return Optional.of(updatedUser);
    }
}
