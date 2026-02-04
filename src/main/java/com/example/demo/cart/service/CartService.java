package com.example.demo.cart.service;

import com.example.demo.cart.model.Cart;
import com.example.demo.cart.model.CartItem;
import com.example.demo.cart.repository.CartRepository;
import com.example.demo.product.model.Product;
import com.example.demo.product.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductService productService;

    // Récupérer ou créer le panier d'un utilisateur
    public Cart getOrCreateCart(Long userId) {
        Optional<Cart> existingCart = cartRepository.findByUserId(userId);
        if (existingCart.isPresent()) {
            return existingCart.get();
        }
        
        Cart newCart = new Cart(userId);
        return cartRepository.save(newCart);
    }

    // Ajouter un produit au panier
    public Optional<Cart> addProductToCart(Long userId, Long productId, Integer quantity) {
        Optional<Product> product = productService.getProductById(productId);
        
        if (product.isEmpty()) {
            return Optional.empty();
        }

        Product p = product.get();
        Cart cart = getOrCreateCart(userId);
        
        CartItem item = new CartItem(
            p.getId(),
            p.getName(),
            p.getPrice(),
            p.getImageUrl(),
            quantity
        );
        
        cart.addItem(item);
        return Optional.of(cartRepository.save(cart));
    }

    // Retirer un produit du panier
    public Optional<Cart> removeProductFromCart(Long userId, Long productId) {
        Optional<Cart> cart = cartRepository.findByUserId(userId);
        
        if (cart.isEmpty()) {
            return Optional.empty();
        }

        Cart c = cart.get();
        c.removeItem(productId);
        return Optional.of(cartRepository.save(c));
    }

    // Mettre à jour la quantité d'un produit
    public Optional<Cart> updateProductQuantity(Long userId, Long productId, Integer quantity) {
        Optional<Cart> cart = cartRepository.findByUserId(userId);
        
        if (cart.isEmpty()) {
            return Optional.empty();
        }

        Cart c = cart.get();
        c.updateItemQuantity(productId, quantity);
        return Optional.of(cartRepository.save(c));
    }

    // Vider le panier
    public Optional<Cart> clearCart(Long userId) {
        Optional<Cart> cart = cartRepository.findByUserId(userId);
        
        if (cart.isEmpty()) {
            return Optional.empty();
        }

        Cart c = cart.get();
        c.clear();
        return Optional.of(cartRepository.save(c));
    }

    // Récupérer le panier
    public Optional<Cart> getCart(Long userId) {
        return cartRepository.findByUserId(userId);
    }
}
