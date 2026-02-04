package com.example.demo.product.service;

import com.example.demo.product.model.Product;
import com.example.demo.product.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    // Créer un produit
    public Product createProduct(String name, String description, Double price, Integer stock, String category, String imageUrl) {
        Product product = new Product(name, description, price, stock, category, imageUrl);
        return productRepository.save(product);
    }

    // Récupérer tous les produits
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Récupérer un produit par ID
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    // Récupérer les produits par catégorie
    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    // Mettre à jour un produit
    public Optional<Product> updateProduct(Long id, String name, String description, Double price, Integer stock, String category, String imageUrl) {
        Optional<Product> existingProduct = productRepository.findById(id);
        
        if (existingProduct.isPresent()) {
            Product product = existingProduct.get();
            if (name != null) product.setName(name);
            if (description != null) product.setDescription(description);
            if (price != null) product.setPrice(price);
            if (stock != null) product.setStock(stock);
            if (category != null) product.setCategory(category);
            if (imageUrl != null) product.setImageUrl(imageUrl);
            return Optional.of(product);
        }
        
        return Optional.empty();
    }

    // Supprimer un produit
    public boolean deleteProduct(Long id) {
        return productRepository.deleteById(id);
    }
}
