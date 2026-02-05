package com.example.demo.user.repository;

import com.example.demo.user.model.AdminRequest;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class AdminRequestRepository {

    private List<AdminRequest> requests = new ArrayList<>();

    // Créer une demande
    public AdminRequest save(AdminRequest request) {
        // Vérifier si une demande existe déjà pour cet email
        Optional<AdminRequest> existing = findByEmail(request.getEmail());
        if (existing.isPresent() && existing.get().getStatus().equals("PENDING")) {
            return existing.get(); // Déjà une demande en attente
        }
        requests.add(request);
        return request;
    }

    // Trouver par email
    public Optional<AdminRequest> findByEmail(String email) {
        return requests.stream()
                .filter(r -> r.getEmail().equals(email))
                .filter(r -> r.getStatus().equals("PENDING"))
                .findFirst();
    }

    // Récupérer toutes les demandes en attente
    public List<AdminRequest> findAllPending() {
        return requests.stream()
                .filter(r -> r.getStatus().equals("PENDING"))
                .toList();
    }

    // Supprimer une demande
    public boolean delete(String email) {
        return requests.removeIf(r -> r.getEmail().equals(email));
    }
}
