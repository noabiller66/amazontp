import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string;
}

export interface User {
  id?: number;
  email: string;
  role?: string;
  admin?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/products';
  
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  /**
   * Récupérer l'utilisateur connecté depuis localStorage
   */
  private getCurrentUser(): User | null {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) return null;
    return JSON.parse(userStr);
  }

  /**
   * Vérifier si l'utilisateur est admin
   */
  private isAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Vérifier le role (peut être "ADMIN" ou "admin")
    return user.role?.toUpperCase() === 'ADMIN' || user.admin === true;
  }

  /**
   * Récupérer tous les produits (accessible à tous)
   */
  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.apiUrl);
  }

  /**
   * Récupérer les produits par catégorie (accessible à tous)
   */
  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}?category=${encodeURIComponent(category)}`);
  }

  /**
   * Récupérer un produit par ID (accessible à tous)
   */
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  /**
   * Créer un nouveau produit (ADMIN UNIQUEMENT)
   */
  createProduct(product: Partial<Product>): Observable<Product> {
    if (!this.isAdmin()) {
      console.error('❌ Accès refusé: Seuls les admins peuvent créer des produits');
      return throwError(() => new Error('Accès refusé: droits administrateur requis'));
    }

    console.log('✅ Admin vérifié, création du produit...');
    return this.http.post<Product>(this.apiUrl, product, this.httpOptions);
  }

  /**
   * Mettre à jour un produit (ADMIN UNIQUEMENT)
   */
  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    if (!this.isAdmin()) {
      console.error('❌ Accès refusé: Seuls les admins peuvent modifier des produits');
      return throwError(() => new Error('Accès refusé: droits administrateur requis'));
    }

    console.log('✅ Admin vérifié, modification du produit...');
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product, this.httpOptions);
  }

  /**
   * Mettre à jour le stock d'un produit (accessible à tous pour les commandes)
   */
  updateProductStock(id: number, newStock: number): Observable<Product> {
    console.log(`📦 Mise à jour du stock pour produit ${id}: ${newStock}`);
    return this.http.patch<Product>(`${this.apiUrl}/${id}/stock`, { stock: newStock }, this.httpOptions);
  }

  /**
   * Supprimer un produit (ADMIN UNIQUEMENT)
   */
  deleteProduct(id: number): Observable<void> {
    if (!this.isAdmin()) {
      console.error('❌ Accès refusé: Seuls les admins peuvent supprimer des produits');
      return throwError(() => new Error('Accès refusé: droits administrateur requis'));
    }

    console.log('✅ Admin vérifié, suppression du produit...');
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Vérifier si l'utilisateur actuel peut modifier les produits
   */
  canManageProducts(): boolean {
    return this.isAdmin();
  }
}
