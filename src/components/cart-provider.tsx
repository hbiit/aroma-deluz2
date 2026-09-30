"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price_kobo: number;
  image_url: string | null;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotalKobo: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  /** False during SSR / before hydration — guards against badge flicker. */
  hydrated: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "aroma-deluz-cart-v1";
const EMPTY: CartItem[] = [];

interface Snapshot {
  items: CartItem[];
  hydrated: boolean;
}

// External store: localStorage-backed cart without setState-in-effect.
let loaded = false;
let items: CartItem[] = EMPTY;
let snapshot: Snapshot = { items: EMPTY, hydrated: false };
const listeners = new Set<() => void>();

function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed)) items = parsed as CartItem[];
  } catch {
    // Corrupt storage — start empty.
  }
  snapshot = { items, hydrated: true };
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Snapshot {
  ensureLoaded();
  return snapshot;
}

// Cached — getServerSnapshot must return a stable reference.
const SERVER_SNAPSHOT: Snapshot = { items: EMPTY, hydrated: false };

function getServerSnapshot(): Snapshot {
  return SERVER_SNAPSHOT;
}

function persist(next: CartItem[]) {
  items = next;
  snapshot = { items: next, hydrated: true };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable — cart still works in memory.
  }
  listeners.forEach((l) => l());
}

export function CartProvider({ children }: { children: ReactNode }) {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    persist(
      items.some((i) => i.id === item.id)
        ? items.map((i) =>
            i.id === item.id ? { ...i, qty: Math.min(i.qty + qty, 99) } : i,
          )
        : [...items, { ...item, qty }],
    );
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    persist(
      qty <= 0
        ? items.filter((i) => i.id !== id)
        : items.map((i) => (i.id === id ? { ...i, qty: Math.min(qty, 99) } : i)),
    );
  }, []);

  const remove = useCallback((id: string) => {
    persist(items.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => persist([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = snap.items.reduce((sum, i) => sum + i.qty, 0);
    const subtotalKobo = snap.items.reduce(
      (sum, i) => sum + i.qty * i.price_kobo,
      0,
    );
    return {
      items: snap.items,
      count,
      subtotalKobo,
      add,
      setQty,
      remove,
      clear,
      hydrated: snap.hydrated,
    };
  }, [snap, add, setQty, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
