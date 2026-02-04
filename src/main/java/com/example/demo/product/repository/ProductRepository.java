package com.example.demo.product.repository;

import com.example.demo.product.model.Product;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class ProductRepository {

    private List<Product> products = new ArrayList<>();

    // Créer un produit
    public Product save(Product product) {
        products.add(product);
        return product;
    }

    // Récupérer tous les produits
    public List<Product> findAll() {
        return new ArrayList<>(products);
    }

    // Récupérer un produit par ID
    public Optional<Product> findById(Long id) {
        return products.stream()
                .filter(p -> p.getId().equals(id))
                .findFirst();
    }

    // Récupérer les produits par catégorie
    public List<Product> findByCategory(String category) {
        return products.stream()
                .filter(p -> p.getCategory().equalsIgnoreCase(category))
                .toList();
    }

    // Supprimer un produit
    public boolean deleteById(Long id) {
        return products.removeIf(p -> p.getId().equals(id));
    }

    // Vérifier si un produit existe
    public boolean existsById(Long id) {
        return products.stream().anyMatch(p -> p.getId().equals(id));
    }
}
