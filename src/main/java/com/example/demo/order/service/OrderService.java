package com.example.demo.order.service;

import com.example.demo.order.model.Order;
import com.example.demo.order.model.OrderItem;
import com.example.demo.order.repository.OrderRepository;
import com.example.demo.cart.model.Cart;
import com.example.demo.cart.model.CartItem;
import com.example.demo.cart.service.CartService;
import com.example.demo.product.model.Product;
import com.example.demo.product.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private ProductService productService;

    // Créer une commande à partir du panier
    public Optional<Order> createOrderFromCart(Long userId) {
        // 1. Récupérer le panier de l'utilisateur
        Optional<Cart> cartOpt = cartService.getCart(userId);
        
        if (cartOpt.isEmpty() || cartOpt.get().getItems().isEmpty()) {
            System.err.println("❌ Panier vide pour l'utilisateur " + userId);
            return Optional.empty();
        }

        Cart cart = cartOpt.get();
        List<OrderItem> orderItems = new ArrayList<>();

        // 2. Vérifier le stock et créer les OrderItems
        for (CartItem cartItem : cart.getItems()) {
            Optional<Product> productOpt = productService.getProductById(cartItem.getProductId());
            
            if (productOpt.isEmpty()) {
                System.err.println("❌ Produit introuvable: " + cartItem.getProductId());
                throw new RuntimeException("Produit introuvable: " + cartItem.getProductName());
            }

            Product product = productOpt.get();

            // Vérifier le stock
            if (product.getStock() < cartItem.getQuantity()) {
                System.err.println("❌ Stock insuffisant pour: " + product.getName() + " (stock: " + product.getStock() + ", demandé: " + cartItem.getQuantity() + ")");
                throw new RuntimeException("Stock insuffisant pour: " + product.getName() + ". Stock disponible: " + product.getStock());
            }

            // Créer l'OrderItem (snapshot du produit au moment de l'achat)
            OrderItem orderItem = new OrderItem(
                product.getId(),
                product.getName(),
                product.getPrice(),
                product.getImageUrl(),
                cartItem.getQuantity()
            );
            orderItems.add(orderItem);
        }

        // 3. Créer la commande
        Order order = new Order(userId, orderItems);
        orderRepository.save(order);

        System.err.println("✅ Commande créée: ID=" + order.getId() + ", Total=" + order.getTotalAmount() + "€");

        // 4. Diminuer le stock des produits
        for (CartItem cartItem : cart.getItems()) {
            Optional<Product> productOpt = productService.getProductById(cartItem.getProductId());
            if (productOpt.isPresent()) {
                Product product = productOpt.get();
                int newStock = product.getStock() - cartItem.getQuantity();
                product.setStock(newStock);
                System.err.println("📦 Stock mis à jour: " + product.getName() + " → " + newStock);
            }
        }

        // 5. Vider le panier
        cartService.clearCart(userId);
        System.err.println("🧹 Panier vidé pour l'utilisateur " + userId);

        return Optional.of(order);
    }

    // Récupérer toutes les commandes d'un utilisateur
    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    // Récupérer une commande par ID
    public Optional<Order> getOrderById(Long orderId) {
        return orderRepository.findById(orderId);
    }

    // Récupérer toutes les commandes (pour admin)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}
