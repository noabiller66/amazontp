import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService, Product } from '../services/productservice';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  products: Product[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Formulaire d'ajout/modification
  showProductForm = false;
  editingProduct: Product | null = null;
  productForm = {
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: '',
    imageUrl: ''
  };

  currentUser: any = null;

  constructor(
    private productService: ProductService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Vérifier si admin
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
      const isAdmin = this.currentUser.role?.toUpperCase() === 'ADMIN' || this.currentUser.admin === true;
      if (!isAdmin) {
        console.log('❌ Accès refusé: pas admin');
        this.router.navigate(['/home']);
        return;
      }
    } else {
      this.router.navigate(['']);
      return;
    }

    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    this.errorMessage = '';
    console.log('🔄 Chargement des produits...');
    
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
        console.log('✅ Produits chargés:', products.length);
        console.log('📦 Produits:', this.products);
        if (products.length === 0) {
          console.log('⚠️ Aucun produit trouvé. Base de données vide ?');
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur chargement produits:', err);
        this.errorMessage = 'Erreur: backend non accessible sur localhost:8080';
        this.isLoading = false;
        this.products = [];
      }
    });
  }

  openAddForm() {
    this.showProductForm = true;
    this.editingProduct = null;
    this.productForm = {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: '',
      imageUrl: ''
    };
  }

  openEditForm(product: Product) {
    this.showProductForm = true;
    this.editingProduct = product;
    this.productForm = {
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      imageUrl: product.imageUrl
    };
  }

  closeForm() {
    this.showProductForm = false;
    this.editingProduct = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  saveProduct() {
    if (!this.productForm.name || !this.productForm.category || this.productForm.price <= 0) {
      this.errorMessage = 'Remplissez tous les champs obligatoires';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    if (this.editingProduct) {
      // Modification
      this.productService.updateProduct(this.editingProduct.id, this.productForm).subscribe({
        next: (updated) => {
          console.log('✅ Produit modifié:', updated);
          this.isLoading = false;
          this.successMessage = 'Produit modifié !';
          this.closeForm();
          this.loadProducts();
        },
        error: (err) => {
          console.error('❌ Erreur modification:', err);
          this.isLoading = false;
          this.errorMessage = err.message || 'Erreur lors de la modification';
        }
      });
    } else {
      // Création
      this.productService.createProduct(this.productForm).subscribe({
        next: (created) => {
          console.log('✅ Produit créé:', created);
          this.isLoading = false;
          this.successMessage = 'Produit créé avec succès !';
          this.closeForm();
          this.loadProducts();
        },
        error: (err) => {
          console.error('❌ Erreur création:', err);
          this.isLoading = false;
          this.errorMessage = err.message || 'Erreur lors de la création';
        }
      });
    }
  }

  deleteProduct(product: Product) {
    if (!confirm(`Supprimer "${product.name}" ?`)) return;

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        console.log('✅ Produit supprimé:', product.id);
        this.successMessage = 'Produit supprimé !';
        this.loadProducts();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error('❌ Erreur suppression:', err);
        this.errorMessage = err.message || 'Erreur lors de la suppression';
      }
    });
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.router.navigate(['']);
  }
}
