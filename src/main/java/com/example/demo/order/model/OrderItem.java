package com.example.demo.order.model;

// Représente un produit dans une commande (snapshot au moment de l'achat)
public class OrderItem {

    private Long productId;
    private String productName;
    private Double productPrice;
    private String productImageUrl;
    private Integer quantity;

    public OrderItem(Long productId, String productName, Double productPrice, String productImageUrl, Integer quantity) {
        this.productId = productId;
        this.productName = productName;
        this.productPrice = productPrice;
        this.productImageUrl = productImageUrl;
        this.quantity = quantity;
    }

    // Getters
    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public Double getProductPrice() {
        return productPrice;
    }

    public String getProductImageUrl() {
        return productImageUrl;
    }

    public Integer getQuantity() {
        return quantity;
    }

    // Total pour cet item
    public Double getTotal() {
        return productPrice * quantity;
    }
}
