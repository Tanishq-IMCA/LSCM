'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { addCartItem, checkoutCart, getCart, removeCartItem, updateCartItem, type CartItem } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

type AddCartItemInput = {
  productCode: string;
  productName: string;
  category: string;
  unitPrice: number;
  imagePath?: string;
};

type CartContextValue = {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  isLoading: boolean;
  addItem: (item: AddCartItemInput) => Promise<void>;
  updateItem: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  checkout: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setIsLoading(true);
    try {
      const result = await getCart();
      setItems(result.items || []);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) void refresh();
  }, [authLoading, refresh]);

  const addItem = useCallback(async (item: AddCartItemInput) => {
    const result = await addCartItem(item);
    setItems(result.items || []);
  }, []);

  const updateItem = useCallback(async (id: string, quantity: number) => {
    const result = await updateCartItem(id, quantity);
    setItems(result.items || []);
  }, []);

  const removeItem = useCallback(async (id: string) => {
    const result = await removeCartItem(id);
    setItems(result.items || []);
  }, []);

  const checkout = useCallback(async () => {
    await checkoutCart();
    setItems([]);
  }, []);

  const value = useMemo(() => ({
    items,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    isLoading,
    addItem,
    updateItem,
    removeItem,
    checkout,
  }), [addItem, checkout, isLoading, items, removeItem, updateItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}