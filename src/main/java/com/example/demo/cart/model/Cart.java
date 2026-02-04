package com.example.demo.cart.model;

import java.util.ArrayList;
import java.util.List;

// représente un panier
public class Cart {

    private Long userId; // ID de l'utilisateur propriétaire du panier
    private List<CartItem> items;

    public Cart(Long userId) {
        this.userId = userId;
        this.items = new ArrayList<>();
    }

    // Getters
    public Long getUserId() {
        return userId;
    }

    public List<CartItem> getItems() {
        return items;
    }

    // Ajouter un produit au panier
    public void addItem(CartItem item) {
        // Vérifier si le produit existe déjà dans le panier
        for (CartItem existingItem : items) {
            if (existingItem.getProductId().equals(item.getProductId())) {
                // Augmenter la quantité
                existingItem.setQuantity(existingItem.getQuantity() + item.getQuantity());
                return;
            }
        }
        // Sinon, ajouter le nouvel article
        items.add(item);
    }

    // Retirer un produit du panier
    public boolean removeItem(Long productId) {
        return items.removeIf(item -> item.getProductId().equals(productId));
    }

    // Mettre à jour la quantité d'un produit
    public boolean updateItemQuantity(Long productId, Integer quantity) {
        for (CartItem item : items) {
            if (item.getProductId().equals(productId)) {
                if (quantity <= 0) {
                    return removeItem(productId);
                }
                item.setQuantity(quantity);
                return true;
            }
        }
        return false;
    }

    // Vider le panier
    public void clear() {
        items.clear();
    }

    // Calculer le total du panier
    public Double getTotal() {
        return items.stream()
                .mapToDouble(CartItem::getTotal)
                .sum();
    }

    // Obtenir le nombre total d'articles
    public Integer getTotalItems() {
        return items.stream()
                .mapToInt(CartItem::getQuantity)
                .sum();
    }
}
