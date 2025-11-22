// src/context/CartContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// โครงสร้างของของในตะกร้า
export interface CartItem {
  uniqueKey: string; // id + size (เพื่อแยกสินค้าเดียวกันแต่คนละไซส์)
  productId: string;
  name: string;
  type: string;
  price: number;
  imageUrl: string;
  size: string;
  quantity: number;
  maxStock: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, size: string, quantity: number, maxStock: number) => void;
  removeFromCart: (uniqueKey: string) => void;
  updateQuantity: (uniqueKey: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // 1. โหลดข้อมูลจาก LocalStorage เมื่อเปิดเว็บ
  useEffect(() => {
    const savedCart = localStorage.getItem('shopping-cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // 2. บันทึกลง LocalStorage ทุกครั้งที่ตะกร้าเปลี่ยน
  useEffect(() => {
    localStorage.setItem('shopping-cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: any, size: string, quantity: number, maxStock: number) => {
    const uniqueKey = `${product._id}-${size}`;
    
    setCart(prev => {
      const existing = prev.find(item => item.uniqueKey === uniqueKey);
      if (existing) {
        // ถ้ามีแล้ว ให้บวกเพิ่ม (แต่ไม่เกินสต็อก)
        const newQty = Math.min(existing.quantity + quantity, maxStock);
        return prev.map(item => item.uniqueKey === uniqueKey ? { ...item, quantity: newQty } : item);
      }
      // ถ้ายังไม่มี ให้เพิ่มใหม่
      return [...prev, {
        uniqueKey,
        productId: product._id,
        name: product.name,
        type: product.type,
        price: product.price,
        imageUrl: product.imageUrl,
        size,
        quantity,
        maxStock
      }];
    });
  };

  const removeFromCart = (uniqueKey: string) => {
    setCart(prev => prev.filter(item => item.uniqueKey !== uniqueKey));
  };

  const updateQuantity = (uniqueKey: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.uniqueKey === uniqueKey) {
        const newQty = Math.max(1, Math.min(item.quantity + delta, item.maxStock));
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};