package com.example.demo.order.repository;

import com.example.demo.order.model.Order;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class OrderRepository {

    private List<Order> orders = new ArrayList<>();

    // Sauvegarder une commande
    public Order save(Order order) {
        orders.add(order);
        return order;
    }

    // Trouver une commande par ID
    public Optional<Order> findById(Long id) {
        return orders.stream()
                .filter(o -> o.getId().equals(id))
                .findFirst();
    }

    // Trouver toutes les commandes d'un utilisateur
    public List<Order> findByUserId(Long userId) {
        return orders.stream()
                .filter(o -> o.getUserId().equals(userId))
                .toList();
    }

    // Récupérer toutes les commandes
    public List<Order> findAll() {
        return new ArrayList<>(orders);
    }
}
