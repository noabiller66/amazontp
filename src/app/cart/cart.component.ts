import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, Cart, CartItem } from '../services/cartservice';
import { ProductService } from '../services/productservice';
import { OrderService } from '../services/orderservice';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  isLoading = true;
  errorMessage = '';
  updatingItem: { [key: number]: boolean } = {};

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private orderService: OrderService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.isLoading = true;
    const userId = this.getUserId();
    
    if (!userId) {
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.getCart(userId).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.enrichCartItems();
      },
      error: (err) => {
        console.error('❌ Erreur chargement panier:', err);
        this.errorMessage = 'Impossible de charger le panier';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  enrichCartItems() {
    if (!this.cart || !this.cart.items || this.cart.items.length === 0) {
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.cart!.items = this.cart!.items.map(item => {
          const product = products.find(p => p.id === item.productId);
          if (product) {
            return {
              ...item,
              productName: product.name,
              price: product.price,
              imageUrl: product.imageUrl
            };
          }
          return item;
        });
        this.calculateTotal();
        this.isLoading = false;
        console.log('🛒 Panier enrichi:', this.cart);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur enrichissement panier:', err);
        this.calculateTotal();
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateQuantity(item: CartItem, newQuantity: number) {
    if (newQuantity < 1) {
      this.removeItem(item);
      return;
    }

    this.updatingItem[item.productId] = true;
    
    this.cartService.updateProductQuantity(item.productId, newQuantity).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.enrichCartItems();
        this.updatingItem[item.productId] = false;
        console.log('✅ Quantité mise à jour');
      },
      error: (err) => {
        console.error('❌ Erreur mise à jour quantité:', err);
        this.updatingItem[item.productId] = false;
        this.cdr.detectChanges();
      }
    });
  }

  removeItem(item: CartItem) {
    if (!confirm(`Supprimer "${item.productName}" du panier ?`)) {
      return;
    }

    this.updatingItem[item.productId] = true;
    
    this.cartService.removeProductFromCart(item.productId).subscribe({
      next: (cart) => {
        this.cart = cart;
        this.enrichCartItems();
        this.updatingItem[item.productId] = false;
        console.log('✅ Produit supprimé du panier');
      },
      error: (err) => {
        console.error('❌ Erreur suppression produit:', err);
        this.updatingItem[item.productId] = false;
        this.cdr.detectChanges();
      }
    });
  }

  clearCart() {
    if (!confirm('Vider tout le panier ?')) {
      return;
    }

    this.isLoading = true;
    
    this.cartService.clearCart().subscribe({
      next: (cart) => {
        this.cart = cart;
        this.calculateTotal();
        this.isLoading = false;
        console.log('✅ Panier vidé');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur vidage panier:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  calculateTotal() {
    if (this.cart && this.cart.items) {
      this.cart.totalPrice = this.cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
  }

  continueShopping() {
    this.router.navigate(['/home']);
  }

  checkout() {
    if (!this.cart || !this.cart.items || this.cart.items.length === 0) {
      return;
    }

    const totalItems = this.itemCount;
    const total = this.cart.totalPrice || 0;
    
    if (!confirm(`Confirmer la commande de ${totalItems} article(s) pour ${total.toFixed(2)}€ ?`)) {
      return;
    }

    this.isLoading = true;

    // Créer la commande via l'API
    this.orderService.createOrder().subscribe({
      next: (order) => {
        console.log('✅ Commande créée avec succès:', order);
        
        // Mettre à jour le panier local
        this.cart = { userId: this.getUserId()!, items: [], totalPrice: 0 };
        
        // Mettre à jour le compteur du panier à 0
        this.cartService.updateCartCount(0);
        
        this.isLoading = false;
        
        const total = order.totalPrice || order.totalAmount || 0;
        alert(`✅ Commande #${order.id} validée avec succès !\nTotal: ${total.toFixed(2)}€`);
        
        // Rediriger vers la page des commandes
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        console.error('❌ Erreur lors de la création de la commande:', err);
        this.isLoading = false;
        
        if (err.status === 400) {
          alert('❌ Erreur: Le panier est vide ou certains produits ne sont plus disponibles.');
        } else if (err.error?.message) {
          alert(`❌ Erreur: ${err.error.message}`);
        } else {
          alert('❌ Erreur lors de la création de la commande. Veuillez réessayer.');
        }
        
        // Recharger le panier pour voir l'état actuel
        this.loadCart();
      }
    });
  }

  private getUserId(): number | null {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || user.userId || 1;
    }
    return null;
  }

  get itemCount(): number {
    return this.cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  }

  get hasItems(): boolean {
    return (this.cart?.items?.length || 0) > 0;
  }

  get isEmpty(): boolean {
    return !this.cart?.items || this.cart.items.length === 0;
  }
}
