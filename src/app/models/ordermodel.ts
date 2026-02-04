export interface Order {
  id: number;
  userId: number;
  userName?: string;
  products: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface OrderCreateRequest {
  userId: number;
  products: {
    productId: number;
    quantity: number;
  }[];
}

export enum OrderStatus {
  PENDING = 'En cours',
  CONFIRMED = 'Confirmé',
  SHIPPED = 'Envoyé',
  DELIVERED = 'Livré',
  CANCELLED = 'Annulé'
}