export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface ProductCreateRequest {
  name: string;
  description: string;
  price: number;
  category: string;
}

export interface ProductUpdateRequest {
  name: string;
  description: string;
  price: number;
  category: string;
}