package com.example.demo.cart.repository;

import com.example.demo.cart.model.Cart;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Repository
public class CartRepository {

    // Stocker les paniers en mémoire (clé = userId)
    private Map<Long, Cart> carts = new HashMap<>();

    // Récupérer le panier d'un utilisateur
    public Optional<Cart> findByUserId(Long userId) {
        return Optional.ofNullable(carts.get(userId));
    }

    // Sauvegarder/Mettre à jour le panier
    public Cart save(Cart cart) {
        carts.put(cart.getUserId(), cart);
        return cart;
    }

    // Supprimer le panier d'un utilisateur
    public boolean deleteByUserId(Long userId) {
        return carts.remove(userId) != null;
    }
}
