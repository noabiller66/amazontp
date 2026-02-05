import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface CartItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Cart {
  userId: number;
  items: CartItem[];
  totalPrice?: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:8080/cart';
  private cartItemsSubject = new BehaviorSubject<number>(0);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCartCount();
  }

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
      return user.id || user.userId || 1; // Fallback to 1 if no ID
    }
    return null;
  }

  private loadCartCount() {
    const userId = this.getUserId();
    if (userId) {
      this.getCart(userId).subscribe({
        next: (cart) => {
          const count = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
          this.cartItemsSubject.next(count);
        },
        error: () => this.cartItemsSubject.next(0)
      });
    }
  }

  getCart(userId: number): Observable<Cart> {
    return this.http.get<Cart>(`${this.apiUrl}/${userId}`, this.getHttpOptions());
  }

  addProductToCart(productId: number, quantity: number = 1): Observable<Cart> {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    const payload = { productId, quantity };
    return this.http.post<Cart>(`${this.apiUrl}/${userId}/items`, payload, this.getHttpOptions())
      .pipe(
        tap((cart) => {
          const count = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
          this.cartItemsSubject.next(count);
          console.log('✅ Produit ajouté au panier:', productId);
        })
      );
  }

  updateProductQuantity(productId: number, quantity: number): Observable<Cart> {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    const payload = { quantity };
    return this.http.put<Cart>(`${this.apiUrl}/${userId}/items/${productId}`, payload, this.getHttpOptions())
      .pipe(
        tap((cart) => {
          const count = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
          this.cartItemsSubject.next(count);
        })
      );
  }

  removeProductFromCart(productId: number): Observable<Cart> {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    return this.http.delete<Cart>(`${this.apiUrl}/${userId}/items/${productId}`, this.getHttpOptions())
      .pipe(
        tap((cart) => {
          const count = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
          this.cartItemsSubject.next(count);
        })
      );
  }

  clearCart(): Observable<Cart> {
    const userId = this.getUserId();
    if (!userId) {
      throw new Error('User not logged in');
    }

    return this.http.delete<Cart>(`${this.apiUrl}/${userId}`, this.getHttpOptions())
      .pipe(
        tap(() => {
          this.cartItemsSubject.next(0);
        })
      );
  }

  getCartItemCount(): number {
    return this.cartItemsSubject.value;
  }

  updateCartCount(count: number): void {
    this.cartItemsSubject.next(count);
  }

  refreshCartCount(): void {
    const userId = this.getUserId();
    if (userId) {
      this.getCart(userId).subscribe({
        next: (cart) => {
          const count = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
          this.cartItemsSubject.next(count);
        },
        error: () => this.cartItemsSubject.next(0)
      });
    } else {
      this.cartItemsSubject.next(0);
    }
  }
}
