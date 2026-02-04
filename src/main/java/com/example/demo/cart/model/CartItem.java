package com.example.demo.cart.model;

// représente un article dans le panier
public class CartItem {

    private Long productId;
    private String productName;
    private Double productPrice;
    private String productImageUrl;
    private Integer quantity;

    public CartItem(Long productId, String productName, Double productPrice, String productImageUrl, Integer quantity) {
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

    // Setters
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    // Calculer le total pour cet article
    public Double getTotal() {
        return productPrice * quantity;
    }
}
