export interface Stock {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
}

export interface StockUpdateRequest {
  productId: number;
  quantity: number;
}