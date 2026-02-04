package com.example.demo.product.model;

// représente un produit
public class Product {

    private static Long idCounter = 0L; // Compteur statique pour auto-incrémentation

    private Long id;
    private String name;
    private String description;
    private Double price;
    private Integer stock;
    private String category;
    private String imageUrl; // URL de l'image du produit

    // constructeur complet
    public Product(String name, String description, Double price, Integer stock, String category, String imageUrl) {
        this.id = ++idCounter; // Auto-incrémentation : 1, 2, 3, 4...
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.category = category;
        this.imageUrl = imageUrl;
    }

    // Getters pour exposer les champs dans la réponse JSON
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Double getPrice() {
        return price;
    }

    public Integer getStock() {
        return stock;
    }

    public String getCategory() {
        return category;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    // Setters pour modifier les propriétés
    public void setName(String name) {
        this.name = name;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}
