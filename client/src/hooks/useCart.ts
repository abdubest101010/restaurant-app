'use client';

import { useState, useEffect, useCallback } from 'react';

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  note?: string;
  modifierOptionIds?: string[];
  modifierNames?: string[];
  modifierPrices?: number[];
}

const CART_KEY = 'tablebite_cart';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [branchId, setBranchId] = useState<string | null>(null);
  const [tableId, setTableId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(CART_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setItems(parsed.items || []);
      setBranchId(parsed.branchId || null);
      setTableId(parsed.tableId || null);
    }
  }, []);

  const persist = useCallback((newItems: CartItem[], bId?: string | null, tId?: string | null) => {
    localStorage.setItem(CART_KEY, JSON.stringify({
      items: newItems,
      branchId: bId ?? branchId,
      tableId: tId ?? tableId,
    }));
  }, [branchId, tableId]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const updated = [...prev, item];
      persist(updated);
      return updated;
    });
  }, [persist]);

  const removeItem = useCallback((index: number) => {
    setItems((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const updateQuantity = useCallback((index: number, quantity: number) => {
    setItems((prev) => {
      const updated = prev.map((item, i) => i === index ? { ...item, quantity } : item);
      persist(updated);
      return updated;
    });
  }, [persist]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(CART_KEY);
  }, []);

  const setContext = useCallback((bId: string, tId?: string) => {
    setBranchId(bId);
    setTableId(tId || null);
    persist(items, bId, tId);
  }, [items, persist]);

  const total = items.reduce((sum, item) => {
    const modTotal = (item.modifierPrices || []).reduce((s, p) => s + p, 0);
    return sum + (item.price + modTotal) * item.quantity;
  }, 0);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, branchId, tableId, addItem, removeItem, updateQuantity, clearCart, setContext, total, itemCount };
}
