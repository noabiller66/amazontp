import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService, Order } from '../services/orderservice';
import { Router } from '@angular/router';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading = true;
    this.error = null;
    this.orders = []; // Réinitialiser les commandes
    
    console.log('🔄 Chargement des commandes...');
    
    this.orderService.getMyOrders().subscribe({
      next: (orders) => {
        console.log('✅ Commandes reçues:', orders);
        
        // Trier les commandes
        this.orders = orders.sort((a, b) => {
          const dateA = new Date(a.orderDate || a.createdAt || '');
          const dateB = new Date(b.orderDate || b.createdAt || '');
          return dateB.getTime() - dateA.getTime();
        });
        
        // Mettre à jour l'état de chargement
        this.loading = false;
        
        console.log('📊 État final - loading:', this.loading, 'orders.length:', this.orders.length);
        console.log('📊 Conditions - !loading:', !this.loading, '!error:', !this.error, 'orders > 0:', this.orders.length > 0);
        
        // Forcer la détection des changements
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement des commandes:', err);
        
        // Vérifier le type d'erreur
        if (err.status === 0) {
          this.error = 'Impossible de se connecter au serveur. Vérifiez que le backend est lancé sur localhost:8080';
        } else if (err.status === 401) {
          this.error = 'Vous devez être connecté pour voir vos commandes.';
          setTimeout(() => this.router.navigate(['/login']), 2000);
        } else if (err.status === 404) {
          this.error = 'Aucune commande trouvée.';
          this.orders = [];
        } else {
          this.error = err.error?.message || 'Impossible de charger vos commandes. Veuillez réessayer.';
        }
        
        this.loading = false;
        this.cdr.detectChanges(); // Forcer la détection des changements
      }
    });
  }

  viewOrderDetails(orderId: number) {
    this.router.navigate(['/orders', orderId]);
  }

  getOrderTotal(order: Order): number {
    return order.totalPrice || order.totalAmount || order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getOrderItemCount(order: Order): number {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'Date inconnue';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusClass(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'en_attente':
        return 'status-pending';
      case 'confirmed':
      case 'confirmee':
        return 'status-confirmed';
      case 'shipped':
      case 'expediee':
        return 'status-shipped';
      case 'delivered':
      case 'livree':
        return 'status-delivered';
      case 'cancelled':
      case 'annulee':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  }

  getStatusLabel(status: string | undefined): string {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'en_attente':
        return 'En attente';
      case 'confirmed':
      case 'confirmee':
        return 'Confirmée';
      case 'shipped':
      case 'expediee':
        return 'Expédiée';
      case 'delivered':
      case 'livree':
        return 'Livrée';
      case 'cancelled':
      case 'annulee':
        return 'Annulée';
      default:
        return status || 'Statut inconnu';
    }
  }
}
