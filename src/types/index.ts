// Product Types
export type ProductType = string;

export interface ProductVariant {
  size: string;
  quantity: number;
  sold: number;
  _id?: string;
}

export interface Product {
  _id: string;
  name: string;
  type: ProductType;
  description?: string;
  price: number;
  imageUrl: string;
  stock: ProductVariant[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Order Types
export type OrderStatus = 
  | 'pending_payment' 
  | 'verification' 
  | 'shipping' 
  | 'completed' 
  | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  size: string;
  quantity: number;
  price: number;
  _id?: string;
  imageUrl?: string; 
}

export interface Order {
  _id: string;
  customerName: string;
  phone: string;
  address?: string;
  isShipping: boolean;
  totalPrice: number;
  paymentProofUrl?: string | null;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

// Cart Types
export interface CartItem {
  uniqueKey?: string;
  productId: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  imageUrl: string;
  maxStock: number;
  type?: string;
}