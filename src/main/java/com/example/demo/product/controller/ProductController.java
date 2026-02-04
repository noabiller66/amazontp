package com.example.demo.product.controller;

import com.example.demo.product.model.Product;
import com.example.demo.product.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    // Créer un nouveau produit
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        String description = (String) payload.get("description");
        Double price = payload.get("price") != null ? ((Number) payload.get("price")).doubleValue() : null;
        Integer stock = payload.get("stock") != null ? ((Number) payload.get("stock")).intValue() : null;
        String category = (String) payload.get("category");
        String imageUrl = (String) payload.get("imageUrl");

        if (name == null || price == null || stock == null) {
            return ResponseEntity.badRequest().build();
        }

        Product product = productService.createProduct(name, description, price, stock, category, imageUrl);
        return ResponseEntity.status(HttpStatus.CREATED).body(product);
    }

    // Récupérer tous les produits
    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts(@RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            List<Product> products = productService.getProductsByCategory(category);
            return ResponseEntity.ok(products);
        }
        
        List<Product> products = productService.getAllProducts();
        return ResponseEntity.ok(products);
    }

    // Récupérer un produit par ID
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Optional<Product> product = productService.getProductById(id);
        return product.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Mettre à jour un produit
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        String name = (String) payload.get("name");
        String description = (String) payload.get("description");
        Double price = payload.get("price") != null ? ((Number) payload.get("price")).doubleValue() : null;
        Integer stock = payload.get("stock") != null ? ((Number) payload.get("stock")).intValue() : null;
        String category = (String) payload.get("category");
        String imageUrl = (String) payload.get("imageUrl");

        Optional<Product> updatedProduct = productService.updateProduct(id, name, description, price, stock, category, imageUrl);
        
        return updatedProduct.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Supprimer un produit
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        boolean deleted = productService.deleteProduct(id);
        
        if (deleted) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
