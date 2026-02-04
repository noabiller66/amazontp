package com.example.demo.cart.controller;

import com.example.demo.cart.model.Cart;
import com.example.demo.cart.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    // Récupérer le panier d'un utilisateur
    @GetMapping("/{userId}")
    public ResponseEntity<Cart> getCart(@PathVariable Long userId) {
        Optional<Cart> cart = cartService.getCart(userId);
        return cart.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(new Cart(userId)));
    }

    // Ajouter un produit au panier
    @PostMapping("/{userId}/items")
    public ResponseEntity<Cart> addProductToCart(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> payload) {
        
        Long productId = payload.get("productId") != null 
            ? ((Number) payload.get("productId")).longValue() 
            : null;
        Integer quantity = payload.get("quantity") != null 
            ? ((Number) payload.get("quantity")).intValue() 
            : 1;

        if (productId == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<Cart> cart = cartService.addProductToCart(userId, productId, quantity);
        return cart.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Mettre à jour la quantité d'un produit
    @PutMapping("/{userId}/items/{productId}")
    public ResponseEntity<Cart> updateProductQuantity(
            @PathVariable Long userId,
            @PathVariable Long productId,
            @RequestBody Map<String, Object> payload) {
        
        Integer quantity = payload.get("quantity") != null 
            ? ((Number) payload.get("quantity")).intValue() 
            : null;

        if (quantity == null) {
            return ResponseEntity.badRequest().build();
        }

        Optional<Cart> cart = cartService.updateProductQuantity(userId, productId, quantity);
        return cart.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Retirer un produit du panier
    @DeleteMapping("/{userId}/items/{productId}")
    public ResponseEntity<Cart> removeProductFromCart(
            @PathVariable Long userId,
            @PathVariable Long productId) {
        
        Optional<Cart> cart = cartService.removeProductFromCart(userId, productId);
        return cart.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Vider le panier
    @DeleteMapping("/{userId}")
    public ResponseEntity<Cart> clearCart(@PathVariable Long userId) {
        Optional<Cart> cart = cartService.clearCart(userId);
        return cart.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
