import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../services/productservice';
import { CartService } from '../services/cartservice';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  selectedCategory: string = '';
  isLoading = true;
  errorMessage = '';
  cartItemCount = 0;
  addingToCart: { [key: number]: boolean } = {};

  constructor(
    private productService: ProductService, 
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('👀 Chargement des produits depuis le backend...');
    this.loadProducts();
    this.cartService.cartItems$.subscribe(count => {
      this.cartItemCount = count;
      this.cdr.detectChanges();
    });
  }

  loadProducts() {
    this.isLoading = true;
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.filteredProducts = products;
        this.extractCategories();
        this.isLoading = false;
        console.log('✅ Produits chargés pour le site:', products.length);
        console.log('📦 Produits:', this.products);
        console.log('🏷️ Catégories:', this.categories);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur chargement produits:', err);
        this.errorMessage = 'Impossible de charger les produits';
        this.isLoading = false;
        this.products = [];
        this.filteredProducts = [];
      }
    });
  }

  extractCategories() {
    const categoriesSet = new Set<string>();
    this.products.forEach(p => {
      if (p.category) {
        categoriesSet.add(p.category);
      }
    });
    this.categories = Array.from(categoriesSet).sort();
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    if (category === '') {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(p => p.category === category);
    }
    console.log('🔍 Filtre appliqué:', category, '→', this.filteredProducts.length, 'produits');
  }

  addToCart(product: Product) {
    if (product.stock === 0) {
      return;
    }

    this.addingToCart[product.id] = true;
    
    this.cartService.addProductToCart(product.id, 1).subscribe({
      next: (cart) => {
        console.log('✅ Produit ajouté au panier:', product.name);
        this.addingToCart[product.id] = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur ajout au panier:', err);
        this.addingToCart[product.id] = false;
        this.cdr.detectChanges();
      }
    });
  }
}
