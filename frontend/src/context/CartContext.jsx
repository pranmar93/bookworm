import React, { createContext, useState, useEffect, useCallback } from 'react';
import cartService from '../services/cartService';
import { useAuth } from '../hooks/useAuth';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], summary: {} });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], summary: {} });
      return;
    }
    setLoading(true);
    try {
      const res = await cartService.getCart();
      setCart(res.data);
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (book_id, quantity = 1) => {
    await cartService.addItem(book_id, quantity);
    await fetchCart();
  }, [fetchCart]);

  const updateItem = useCallback(async (cartItemId, quantity) => {
    await cartService.updateItem(cartItemId, quantity);
    await fetchCart();
  }, [fetchCart]);

  const removeItem = useCallback(async (cartItemId) => {
    await cartService.removeItem(cartItemId);
    await fetchCart();
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    await cartService.clearCart();
    setCart({ items: [], summary: {} });
  }, []);

  const itemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      itemCount,
      fetchCart,
      addToCart,
      updateItem,
      removeItem,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};
