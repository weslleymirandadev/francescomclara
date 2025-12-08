"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";

export type CartItemType = "course" | "journey";

export interface CartItem {
  id: string; // slug
  title: string;
  type: CartItemType;
  price: number;
}

interface CartContextValue {
  items: CartItem[];
  total: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { status } = useSession();
  const initializedRef = useRef(false);
  const hasSyncedWithServerRef = useRef(false);
  
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const STORAGE_KEY = "cart:guest";

  // 1) Carrega carrinho guest do localStorage na primeira montagem
  useEffect(() => {
    if (initializedRef.current) return;
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartItem[];
        if (Array.isArray(parsed)) {
          // Ensure all prices are stored in cents
          const normalizedItems = parsed.map(item => ({
            ...item,
            price: item.price // Keep in cents
          }));
          setItems(normalizedItems);
        }
      }
    } catch {
      // ignora erros de parse
    }

    initializedRef.current = true;
  }, []);

  // 2) Sempre que items mudar, persiste como guest no localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  function addItem(item: CartItem) {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id && i.type === item.type);
      if (exists) return prev;
      // Ensure we're storing the price in cents
      return [...prev, { ...item, price: item.price }];
    });
    openCart(); // Abre o carrinho quando um item é adicionado
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function clearCart() {
    setItems([]);
  }

  // 3) Quando autenticar pela primeira vez, mescla carrinho guest com o do servidor
  useEffect(() => {
    if (!initializedRef.current) return;
    if (status !== "authenticated") return;
    if (hasSyncedWithServerRef.current) return;

    async function syncWithServer() {
      try {
        // Busca carrinho atual do servidor
        const res = await fetch("/api/cart", { cache: "no-store" });
        let serverItems: {
          itemType: "COURSE" | "JOURNEY";
          courseId?: string | null;
          journeyId?: string | null;
          title: string | null;
          price: number | null;
        }[] = [];

        if (res.ok) {
          const data = await res.json();
          serverItems = Array.isArray(data.items) ? data.items : [];
        }

        // Normaliza items do servidor para o formato do CartContext
        const serverCart: CartItem[] = serverItems
          .map((item) => {
            const id = item.courseId ?? item.journeyId ?? undefined;
            if (!id || item.price == null || !item.title) return null;

            return {
              id,
              title: item.title,
              price: item.price,
              type: item.itemType === "JOURNEY" ? ("journey" as CartItemType) : ("course" as CartItemType),
            } as CartItem;
          })
          .filter(Boolean) as CartItem[];

        // Mescla guest (items) + serverCart por (type,id), sem quantidade
        const mergedMap = new Map<string, CartItem>();

        function mergeSource(list: CartItem[]) {
          for (const item of list) {
            const key = `${item.type}:${item.id}`;
            if (!mergedMap.has(key)) {
              mergedMap.set(key, { ...item });
            }
          }
        }

        mergeSource(serverCart);
        mergeSource(items);

        const merged = Array.from(mergedMap.values());
        setItems(merged);

        // Limpa carrinho guest em localStorage após migração
        try {
          if (typeof window !== "undefined") {
            window.localStorage.removeItem(STORAGE_KEY);
          }
        } catch {
          // ignore
        }

        // Envia carrinho mesclado para o servidor
        await fetch("/api/cart", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            items: merged.map((item) => ({
              itemType: item.type === "journey" ? "JOURNEY" : "COURSE",
              courseId: item.type === "course" ? item.id : null,
              journeyId: item.type === "journey" ? item.id : null,
              quantity: 1,
            })),
          }),
        });

        hasSyncedWithServerRef.current = true;
      } catch {
        // Em caso de erro, mantém apenas o carrinho em memória/localStorage
      }
    }

    void syncWithServer();
  }, [status, items]);

  // Total is kept in cents for internal calculations
  const totalInCents = useMemo(
    () => items.reduce((acc, item) => acc + item.price, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      total: totalInCents, // Expose total in cents
      isCartOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      clearCart,
    }),
    [items, isCartOpen, openCart, closeCart, addItem, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return ctx;
}
