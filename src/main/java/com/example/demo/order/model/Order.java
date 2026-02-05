package com.example.demo.order.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

// Représente une commande
public class Order {

    private static Long idCounter = 0L; // Auto-incrémentation

    private Long id;
    private Long userId;
    private List<OrderItem> items;
    private Double totalAmount;
    private LocalDateTime orderDate;

    public Order(Long userId, List<OrderItem> items) {
        this.id = ++idCounter;
        this.userId = userId;
        this.items = new ArrayList<>(items);
        this.totalAmount = calculateTotal();
        this.orderDate = LocalDateTime.now();
    }

    // Calculer le total de la commande
    private Double calculateTotal() {
        return items.stream()
                .mapToDouble(OrderItem::getTotal)
                .sum();
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    // Nombre total d'articles
    public Integer getTotalItems() {
        return items.stream()
                .mapToInt(OrderItem::getQuantity)
                .sum();
    }
}
