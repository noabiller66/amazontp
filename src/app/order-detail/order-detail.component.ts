import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrderService, Order } from '../services/orderservice';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetail(parseInt(orderId, 10));
    } else {
      this.error = 'ID de commande invalide';
    }
  }

  loadOrderDetail(orderId: number) {
    this.loading = true;
    this.error = null;
    this.order = null; // Réinitialiser la commande

    console.log('🔄 Chargement de la commande #' + orderId);

    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        console.log('✅ Commande reçue:', order);
        this.order = order;
        this.loading = false;
        
        console.log('📊 État final - loading:', this.loading, 'order:', this.order?.id);
        this.cdr.detectChanges(); // Forcer la détection des changements
      },
      error: (err) => {
        console.error('❌ Erreur lors du chargement de la commande:', err);
        
        if (err.status === 0) {
          this.error = 'Impossible de se connecter au serveur. Vérifiez que le backend est lancé sur localhost:8080';
        } else if (err.status === 404) {
          this.error = 'Commande introuvable.';
        } else {
          this.error = err.error?.message || 'Impossible de charger les détails de la commande.';
        }
        
        this.loading = false;
        this.cdr.detectChanges(); // Forcer la détection des changements
      }
    });
  }

  goBack() {
    this.router.navigate(['/orders']);
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

  getItemTotal(price: number, quantity: number): number {
    return price * quantity;
  }
}
