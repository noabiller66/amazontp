package com.example.demo.order.controller;

import com.example.demo.order.model.Order;
import com.example.demo.order.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Créer une commande à partir du panier
    @PostMapping("/user/{userId}")
    public ResponseEntity<Order> createOrder(@PathVariable Long userId) {
        try {
            Optional<Order> order = orderService.createOrderFromCart(userId);
            
            if (order.isPresent()) {
                return ResponseEntity.status(HttpStatus.CREATED).body(order.get());
            } else {
                return ResponseEntity.badRequest().build(); // Panier vide
            }
        } catch (RuntimeException e) {
            // Stock insuffisant ou autre erreur
            throw e;
        }
    }

    // Récupérer toutes les commandes d'un utilisateur
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        List<Order> orders = orderService.getUserOrders(userId);
        return ResponseEntity.ok(orders);
    }

    // Récupérer une commande par ID
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long orderId) {
        Optional<Order> order = orderService.getOrderById(orderId);
        return order.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Récupérer toutes les commandes (pour admin)
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }
}
