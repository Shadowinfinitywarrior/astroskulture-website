import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { CartItem } from '../lib/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (productId: string, size: string, color?: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number, color?: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  getItemQuantity: (productId: string, size: string, color?: string) => number;
}

const CartContext = createContext < CartContextType | undefined > (undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState < CartItem[] > (() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setItems(current => {
      const existing = current.find(i =>
        i.productId === item.productId && i.size === item.size && i.color === item.color
      );

      if (existing) {
        return current.map(i =>
          i.productId === item.productId && i.size === item.size && i.color === item.color
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...current, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string, size: string, color?: string) => {
    setItems(current =>
      current.filter(i => !(i.productId === productId && i.size === size && i.color === color))
    );
  };

  const updateQuantity = (productId: string, size: string, quantity: number, color?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    setItems(current =>
      current.map(i =>
        i.productId === productId && i.size === size && i.color === color
          ? { ...i, quantity }
          : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getItemQuantity = (productId: string, size: string, color?: string): number => {
    const item = items.find(i =>
      i.productId === productId && i.size === size && i.color === color
    );
    return item ? item.quantity : 0;
  };

  const cartTotal = items.reduce((sum, item) => {
    const price = item.discountPrice || item.price;
    return sum + (price * item.quantity);
  }, 0);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      getItemQuantity
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}