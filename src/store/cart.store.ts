import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { CartStore, CartItem } from '@/types/cart.types';

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (newItem: CartItem) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.id === newItem.id);
          
          if (existingItem) {
            // Prevent adding more than available stock
            const updatedQuantity = Math.min(
              existingItem.quantity + newItem.quantity,
              existingItem.stock
            );
            
            return {
              items: state.items.map((item) =>
                item.id === newItem.id
                  ? { ...item, quantity: updatedQuantity }
                  : item
              ),
            };
          }
          
          return { items: [...state.items, newItem] };
        });
      },
      
      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      
      updateQuantity: (id: string, quantity: number) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                quantity: Math.max(1, Math.min(quantity, item.stock)), // Keep between 1 and max stock
              };
            }
            return item;
          }),
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      getCartTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      
      getCartCount: () => {
        const { items } = get();
        return items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'nxtstore-cart-storage', // Key used in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
);
