import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timeout, catchError, throwError } from 'rxjs';

export interface OrderItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Order {
  id?: number;
  userId: number;
  items: OrderItem[];
  totalPrice?: number;
  totalAmount?: number; // Le backend peut renvoyer totalAmount au lieu de totalPrice
  status?: string;
  orderDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/orders';

  constructor(private http: HttpClient) {}

  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }),
      withCredentials: true
    };
  }

  private getUserId(): number | null {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.id || user.userId || null;
    }
    return null;
  }

  /**
   * Créer une commande à partir du panier de l'utilisateur
   * @param userId ID de l'utilisateur
   * @returns Observable<Order>
   */
  createOrderFromCart(userId: number): Observable<Order> {
    return this.http.post<Order>(
      `${this.apiUrl}/user/${userId}`, 
      {}, 
      this.getHttpOptions()
    );
  }

  /**
   * Créer une commande à partir du panier de l'utilisateur connecté
   * @returns Observable<Order>
   */
  createOrder(): Observable<Order> {
    const userId = this.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not logged in'));
    }
    return this.createOrderFromCart(userId).pipe(
      timeout(15000), // Timeout de 15 secondes
      catchError(err => {
        console.error('Erreur dans createOrder:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Récupérer toutes les commandes d'un utilisateur
   * @param userId ID de l'utilisateur
   * @returns Observable<Order[]>
   */
  getUserOrders(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(
      `${this.apiUrl}/user/${userId}`, 
      this.getHttpOptions()
    );
  }

  /**
   * Récupérer les commandes de l'utilisateur connecté
   * @returns Observable<Order[]>
   */
  getMyOrders(): Observable<Order[]> {
    const userId = this.getUserId();
    if (!userId) {
      return throwError(() => new Error('User not logged in'));
    }
    return this.getUserOrders(userId).pipe(
      timeout(10000), // Timeout de 10 secondes
      catchError(err => {
        console.error('Erreur dans getMyOrders:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Récupérer une commande par son ID
   * @param orderId ID de la commande
   * @returns Observable<Order>
   */
  getOrderById(orderId: number): Observable<Order> {
    return this.http.get<Order>(
      `${this.apiUrl}/${orderId}`, 
      this.getHttpOptions()
    ).pipe(
      timeout(10000), // Timeout de 10 secondes
      catchError(err => {
        console.error('Erreur dans getOrderById:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Récupérer toutes les commandes (pour admin)
   * @returns Observable<Order[]>
   */
  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(
      `${this.apiUrl}`, 
      this.getHttpOptions()
    );
  }
}
