import { useSyncExternalStore } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string | null;
  quantity: number;
}

const KEY = "aa_cart";
const listeners = new Set<() => void>();
let items: CartItem[] = (() => {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
})();

const save = (next: CartItem[]) => {
  items = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
  listeners.forEach(l => l());
};

export const cart = {
  add(p: { id: string; name: string; price: number; image?: string | null }, qty = 1) {
    const existing = items.find(i => i.id === p.id);
    save(existing
      ? items.map(i => i.id === p.id ? { ...i, quantity: Math.min(100, i.quantity + qty) } : i)
      : [...items, { ...p, quantity: qty }]);
  },
  setQty(id: string, qty: number) {
    save(qty <= 0 ? items.filter(i => i.id !== id) : items.map(i => i.id === id ? { ...i, quantity: Math.min(100, qty) } : i));
  },
  remove(id: string) { save(items.filter(i => i.id !== id)); },
  clear() { save([]); },
};

const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };

export const useCart = () => {
  const list = useSyncExternalStore(subscribe, () => items);
  const count = list.reduce((s, i) => s + i.quantity, 0);
  const total = list.reduce((s, i) => s + i.price * i.quantity, 0);
  return { items: list, count, total };
};
