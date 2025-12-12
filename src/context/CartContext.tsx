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
import { toast } from 'react-hot-toast';

export interface CartItem {
  id: string; // slug
  title: string;
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

  // Load cart from server or localStorage on mount
  useEffect(() => {
    if (initializedRef.current) return; // Evitar múltiplas execuções
    
    const loadCart = async () => {
      if (status === 'authenticated') {
        try {
          const response = await fetch('/api/cart');
          if (response.ok) {
            const { items: serverItems } = await response.json();
            // Normalize server items to match CartItem format
            const normalizedItems = (serverItems || [])
              .map((item: any) => {
                if (!item.courseId || item.price == null || !item.title) return null;
                
                return {
                  id: item.courseId,
                  title: item.title,
                  price: item.price,
                  type: 'course',
                };
              })
              .filter(Boolean) as CartItem[];
            
            if (normalizedItems.length > 0) {
              setItems(normalizedItems);
              initializedRef.current = true;
              return; // Skip localStorage check
            }
          }
        } catch (error) {
          console.error('Failed to load cart from server', error);
        }
      }
      
      // Fallback to localStorage for guests or if server fetch fails
      const savedCart = localStorage.getItem(STORAGE_KEY);
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          if (Array.isArray(parsedCart)) {
            setItems(parsedCart);
          }
        } catch (error) {
          console.error('Failed to parse cart from localStorage', error);
        }
      }
      
      initializedRef.current = true;
    };

    loadCart();
  }, [status]); // Re-run when auth status changes

  // Save cart to localStorage when it changes (for guests)
  // 2) Sempre que items mudar, persiste como guest no localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  async function addItem(item: CartItem) {
    // 1. Check if item is already in cart (case-insensitive and ignoring whitespace)
    const normalizedItemId = item.id.trim().toLowerCase();
    const alreadyInCart = items.some(i => 
      i.id.trim().toLowerCase() === normalizedItemId
    );
    
    if (alreadyInCart) {
      toast.error('Este curso já está no seu carrinho');
      openCart();
      return;
    }

    // 2. Check if user already has access to this course
    if (status === "authenticated") {
      try {
        const response = await fetch(`/api/user/has-access?id=${item.id}`);
        const { hasAccess } = await response.json();

        if (hasAccess) {
          toast.error('Você já tem acesso a este curso');
          return;
        }
      } catch (error) {
        console.error("Error checking access:", error);
        // Continue with adding to cart if there's an error checking access
      }
    }

    // 3. If we get here, it's safe to add the item
    const newItem = { ...item, price: item.price };
    const newItems = [...items, newItem];
    
    // 4. Update server if authenticated
    if (status === 'authenticated') {
      try {
        // First, get the current cart
        const cartResponse = await fetch('/api/cart');
        const { items: currentItems = [] } = await cartResponse.json();
        
        // Create the new item in the format expected by the API
        const newItem = {
          itemType: 'COURSE',
          courseId: item.id,
          quantity: 1
        };
        
        // Add the new item to the existing items
        const updatedItems = [...currentItems, newItem];
        
        // Send the complete updated cart
        const response = await fetch('/api/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: updatedItems })
        });
        
        if (!response.ok) {
          throw new Error('Failed to update server cart');
        }
      } catch (error) {
        console.error('Failed to update server cart:', error);
        toast.error('Erro ao adicionar ao carrinho. Tente novamente.');
        return;
      }
    }
    
    // 5. Update local state
    setItems(newItems);
    openCart();
  }


  async function removeItem(id: string) {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    
    // If user is authenticated, sync with server
    if (status === "authenticated") {
      try {
        // Remove item from server
        const response = await fetch(`/api/cart`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            itemId: id,
            itemType: 'COURSE',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to remove item from server');
        }

        // Refresh cart from server to ensure consistency
        const res = await fetch("/api/cart", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const serverItems = Array.isArray(data.items) ? data.items : [];
          
          // Normalize server items to match CartItem format
          const normalizedItems = serverItems
            .filter((item: any) => item.courseId) // Only include course items
            .map((item: any) => ({
              id: item.courseId,
              title: item.title || 'Curso',
              price: item.price || 0,
              type: 'course' as const,
            }))
            .filter((item: any) => item.id && item.title && item.price !== undefined);
          
          setItems(normalizedItems);
        }
      } catch (error) {
        console.error("Error removing item:", error);
      }
    }
  }

  function clearCart() {
    setItems([]);

    // Se o usuário estiver autenticado, limpa o carrinho no servidor também
    if (status === "authenticated") {
      fetch("/api/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clear: true }),
      }).catch(console.error);
    }
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
          itemType: "COURSE";
          courseId?: string | null;
          title: string | null;
          price: number | null;
        }[] = [];

        if (res.ok) {
          const data = await res.json();
          // Filtra apenas itens do tipo curso
          serverItems = Array.isArray(data.items) 
            ? data.items.filter((item: any) => item.itemType === 'COURSE' && item.courseId)
            : [];
        }

        // Normaliza items do servidor para o formato do CartContext
        const serverCart: CartItem[] = serverItems
          .filter(item => item.courseId && item.price !== null && item.title)
          .map(item => ({
            id: item.courseId!,
            title: item.title!,
            price: item.price!,
            type: 'course' as const,
          }));

        // Pega items atuais do estado (sem usar items diretamente para evitar loop)
        setItems(currentItems => {
          // Mescla guest (currentItems) + serverCart por id
          const mergedMap = new Map<string, CartItem>();

          function mergeSource(list: CartItem[]) {
            for (const item of list) {
              if (!mergedMap.has(item.id)) {
                mergedMap.set(item.id, { ...item });
              }
            }
          }

          mergeSource(serverCart);
          mergeSource(currentItems);

          const merged = Array.from(mergedMap.values());
          
          // Envia carrinho mesclado para o servidor (async, não bloqueia)
          fetch("/api/cart", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              items: merged.map(item => ({
                itemType: 'COURSE',
                courseId: item.id,
                quantity: 1,
              })),
            }),
          }).catch(console.error);

          // Limpa carrinho guest em localStorage após migração
          try {
            if (typeof window !== "undefined") {
              window.localStorage.removeItem(STORAGE_KEY);
            }
          } catch {
            // ignore
          }

          hasSyncedWithServerRef.current = true;
          
          return merged;
        });
      } catch (error) {
        console.error("Error syncing cart with server:", error);
        // Em caso de erro, mantém apenas o carrinho em memória/localStorage
        hasSyncedWithServerRef.current = true; // Marca como sincronizado mesmo em caso de erro para evitar loops
      }
    }

    void syncWithServer();
  }, [status]); // Removido 'items' das dependências para evitar loop infinito

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
