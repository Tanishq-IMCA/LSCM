"use client";

import { createContext, useContext, useState, ReactNode, useMemo } from 'react';

interface CartItem {
  name: string;
  price?: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  increaseQuantity: (name: string) => void;
  decreaseQuantity: (name: string) => void;
  removeFromCart: (name: string) => void;
  itemCount: number;
  totalCost: number;
  isCartOpen: boolean;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleCart = () => setIsCartOpen(prev => !prev);

  const addToCart = (itemToAdd: Omit<CartItem, 'quantity'>) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.name === itemToAdd.name);
      if (existingItem) {
        return prevItems.map(item =>
          item.name === itemToAdd.name ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...itemToAdd, quantity: 1 }];
    });
  };

  const increaseQuantity = (name: string) => {
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.name === name ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (name: string) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.name === name);
      // If item quantity is 1, pressing '-' removes it from the cart.
      if (existingItem && existingItem.quantity === 1) {
        return prevItems.filter(item => item.name !== name);
      }
      // Otherwise, just decrease the quantity.
      return prevItems.map(item =>
        item.name === name ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item
      );
    });
  };
  
  const removeFromCart = (name: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.name !== name));
  };

  const itemCount = useMemo(() => 
    cartItems.reduce((total, item) => total + item.quantity, 0), 
    [cartItems]
  );

  const totalCost = useMemo(() =>
    cartItems.reduce((total, item) => {
      const price = item.price ? parseFloat(item.price) : 0;
      return total + price * item.quantity;
    }, 0),
    [cartItems]
  );

  const value = {
    cartItems,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    itemCount,
    totalCost,
    isCartOpen,
    toggleCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};