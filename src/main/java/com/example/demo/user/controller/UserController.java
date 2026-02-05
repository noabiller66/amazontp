package com.example.demo.user.controller;
 
// import com.example.demo.user.controller.dto.RegisterRequest;
import com.example.demo.user.controller.dto.RegisterResponse;
// import com.example.demo.user.controller.dto.loginRequest;
import com.example.demo.user.controller.dto.ForgotPasswordRequest;
import com.example.demo.user.controller.dto.VerifyCodeRequest;
// import com.example.demo.user.controller.dto.VerifyLoginCodeRequest;
import com.example.demo.user.controller.dto.ResetPasswordRequest;
import com.example.demo.user.model.User;
import com.example.demo.user.model.AdminRequest;
import com.example.demo.user.service.UserService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;



// crée un bean (objet géré par spring) 
// plutôt que de le faire à la main et donc gérer la durée de vie
@RestController
@CrossOrigin(origins = "http://localhost:4200") // Permet les requêtes depuis Angular
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    public List<User> getUsers() {
        return userService.getUsers();
    }
    @GetMapping("/user")
    public User getUser(@RequestParam Long id) {
        return userService.getUserById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Route pour générer un nouveau salt (pour l'inscription)
    @GetMapping("/salt")
    public Map<String, String> getSalt(@RequestParam(required = false) String email) {
        String salt;
        if (email != null && !email.isEmpty()) {
            // Si email fourni, retourne le salt de cet utilisateur (pour le login)
            // SÉCURITÉ : Si l'utilisateur n'existe pas, on génère un salt aléatoire
            // pour ne PAS révéler que l'email n'existe pas dans la base
            salt = userService.getSaltByEmail(email)
                    .orElseGet(() -> {
                        // L'utilisateur n'existe pas, mais on retourne quand même un salt
                        // Ainsi, l'attaquant ne peut pas deviner si l'email existe ou non
                        System.err.println("⚠️ Tentative de récupération de salt pour email inexistant: " + email);
                        return userService.generateSalt(); // Salt aléatoire jetable
                    });
        } else {
            // Sinon, génère un nouveau salt (pour l'inscription)
            salt = userService.generateSalt();
        }
        return Map.of("salt", salt);
    }

    //     @PostMapping("/anniv")
    // public User anniversaire(@RequestParam Long id) {
    //     return userService.anniversaire(id)
    //     .orElseThrow(() -> new RuntimeException("User not found"));
    // }

    //  @PutMapping("/user")
    // public User updateUserName(@Valid @RequestBody UpdateUserNameRequest request) {
    //     return userService.updateUserName(request.getId(), request.getName())
    //             .orElseThrow(() -> new RuntimeException("User not found"));
    // }
    
    @PostMapping("/user")
    public RegisterResponse register(@Valid @RequestBody Map<String, String> request) {
        String email = request.get("email");
        String hashedPassword = request.get("pass"); // Hash reçu du frontend (password + salt)
        
        // Le frontend a demandé un salt via GET /salt, on doit le récupérer
        // Mais le frontend ne nous l'a pas renvoyé dans la requête...
        // Solution : regarder si le salt est dans la requête, sinon erreur
        String salt = request.get("salt");
        if (salt == null || salt.isEmpty()) {
            throw new RuntimeException("Le salt est manquant dans la requête");
        }
        
        System.err.println("Inscription - email: " + email);
        System.err.println("Hash reçu du frontend (déjà salé): " + hashedPassword);
        System.err.println("Salt reçu: " + salt);
        
        try {
            User user = userService.registerUser(email, hashedPassword, salt);
            
            // Retourne une réponse avec le salt (au cas où le frontend en a besoin)
            return new RegisterResponse(user.getId(), user.getEmail(), user.getSalt());
        } catch (RuntimeException e) {
            // Si l'email existe déjà, renvoie une erreur claire
            System.err.println("❌ Erreur lors de l'inscription: " + e.getMessage());
            throw e; // Relance l'exception pour que Spring la gère
        }
    }

    @PostMapping("/login")
    public User login(@Valid @RequestBody Map<String, String> request) {
        String email = request.get("email");
        String hashedPassword = request.get("pass"); // Déjà haché par le frontend
        
        System.err.println("Connexion - email: " + email);
        System.err.println("Hash reçu du frontend (déjà salé): " + hashedPassword);
        
        return userService.loginUser(email, hashedPassword)
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));
    }

    // ===== ROUTES POUR MOT DE PASSE OUBLIÉ AVEC A2F =====

    /**
     * Étape 1 : Demande de réinitialisation du mot de passe
     * Génère un code A2F et l'affiche dans System.err (console serveur)
     * SÉCURITÉ : Message anti-oracle
     */
    @PostMapping("/forgot-password")
    public Map<String, String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        System.out.println("\n🔐 Demande de réinitialisation pour: " + request.getEmail());
        
        // Génère le code (retourne vide si l'email n'existe pas)
        userService.requestPasswordReset(request.getEmail());
        
        // MESSAGE ANTI-ORACLE : Toujours le même, que l'email existe ou non
        return Map.of(
            "message", "Si votre email est associé à un compte, un code de vérification a été envoyé. Consultez la console du serveur.",
            "success", "true"
        );
    }

    /**
     * Étape 2 (optionnelle) : Vérification du code A2F
     * Permet de valider le code avant de soumettre le nouveau mot de passe
     */
    @PostMapping("/verify-reset-code")
    public Map<String, Boolean> verifyResetCode(@Valid @RequestBody VerifyCodeRequest request) {
        System.err.println("\n🔍 Vérification du code pour: " + request.getEmail());
        
        boolean isValid = userService.verifyResetCode(request.getEmail(), request.getCode());
        
        return Map.of("valid", isValid);
    }

    /**
     * Étape 3 : Réinitialisation du mot de passe
     * Vérifie le code A2F et met à jour le mot de passe avec hachage + salage + poivrage
     */
    @PostMapping("/reset-password")
    public Map<String, String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        System.err.println("\n🔄 Réinitialisation du mot de passe pour: " + request.getEmail());
        
        Optional<User> updatedUser = userService.resetPassword(
            request.getEmail(),
            request.getCode(),
            request.getNewPassword(), // Hash reçu du frontend (password + salt)
            request.getSalt()
        );

        if (updatedUser.isPresent()) {
            return Map.of(
                "message", "Mot de passe réinitialisé avec succès",
                "success", "true"
            );
        } else {
            throw new RuntimeException("Code de vérification invalide ou expiré");
        }
    }

    // Générer un code pour promouvoir un utilisateur en admin
    @PostMapping("/admin/generate-code")
    public Map<String, String> generateAdminCode() {
        String code = userService.generateAdminPromotionCode();
        return Map.of(
            "code", code,
            "message", "Code admin généré. Valide pendant 10 minutes.",
            "validityMinutes", "10"
        );
    }

    // Promouvoir un utilisateur en admin avec le code
    @PostMapping("/admin/promote")
    public Map<String, String> promoteToAdmin(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String adminCode = request.get("code");

        if (email == null || adminCode == null) {
            throw new RuntimeException("Email et code requis");
        }

        boolean promoted = userService.promoteToAdmin(email, adminCode);

        if (promoted) {
            return Map.of(
                "message", "Utilisateur promu admin avec succès",
                "email", email,
                "role", "ADMIN"
            );
        } else {
            throw new RuntimeException("Échec de la promotion. Code invalide ou utilisateur déjà admin.");
        }
    }

    // ===== SYSTÈME DE DEMANDES ADMIN =====

    // Demander à devenir admin (bouton côté utilisateur)
    @PostMapping("/admin/request")
    public Map<String, String> requestAdminRole(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null) {
            throw new RuntimeException("Email requis");
        }

        AdminRequest adminRequest = userService.requestAdminRole(email);

        return Map.of(
            "message", "Demande envoyée avec succès. En attente de validation.",
            "email", email,
            "status", adminRequest.getStatus()
        );
    }

    // Voir toutes les demandes en attente (pour les admins)
    @GetMapping("/admin/requests")
    public List<AdminRequest> getPendingAdminRequests() {
        return userService.getPendingAdminRequests();
    }

    // Approuver une demande (admin génère un code et l'utilise)
    @PostMapping("/admin/approve")
    public Map<String, String> approveAdminRequest(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String adminCode = request.get("code");

        if (email == null || adminCode == null) {
            throw new RuntimeException("Email et code requis");
        }

        boolean approved = userService.approveAdminRequest(email, adminCode);

        if (approved) {
            return Map.of(
                "message", "Demande approuvée. Utilisateur promu admin.",
                "email", email
            );
        } else {
            throw new RuntimeException("Échec de l'approbation");
        }
    }

    // Rejeter une demande
    @PostMapping("/admin/reject")
    public Map<String, String> rejectAdminRequest(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null) {
            throw new RuntimeException("Email requis");
        }

        boolean rejected = userService.rejectAdminRequest(email);

        if (rejected) {
            return Map.of(
                "message", "Demande rejetée",
                "email", email
            );
        } else {
            throw new RuntimeException("Demande non trouvée");
        }
    }
    
}
