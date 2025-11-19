// src/types/index.ts

// =========================================
// 👕 Product Types
// =========================================

export type ProductType = 'normal' | 'mourning';

export interface ProductVariant {
  size: string;
  quantity: number;
  sold: number;
  _id?: string; // บางที Mongoose แถม id มาให้ใน sub-document
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
  createdAt: string; // รับจาก API จะเป็น string ISO8601
  updatedAt: string;
}

// =========================================
// 📦 Order Types
// =========================================

export type OrderStatus = 
  | 'pending_payment' 
  | 'verification' 
  | 'shipping' 
  | 'completed' 
  | 'cancelled';

export interface OrderItem {
  productId: string; // เก็บเป็น ID string
  productName: string;
  size: string;
  quantity: number;
  price: number;
  _id?: string;
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

// =========================================
// 🛒 Cart Types (แถมให้สำหรับทำตะกร้าสินค้า)
// =========================================

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  size: string;
  quantity: number;
  imageUrl: string;
  maxStock: number; // เอาไว้กัน User กดเกินจำนวนที่มีจริง
}