import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  id: string;
  title: string;
  image: string;
  price: string;
  requirements: string;
  description?: string; // Legacy field for backward compatibility
  descriptionEn?: string;
  descriptionRu?: string;
  brand: string;
  model: string;
  year: string;
};

type CartStore = {
  items: CartItem[];
  currentVehicle: string | null; // Format: "brand-model-year"
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => string;
  getItemCount: () => number;
  checkAndClearForNewVehicle: (brand: string, model: string, year: string) => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      currentVehicle: null,
      addItem: (item) => {
        const existingItems = get().items;
        // Check if item already exists
        if (!existingItems.find((i) => i.id === item.id)) {
          set({ items: [...existingItems, item] });
        }
      },
      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },
      clearCart: () => {
        set({ items: [], currentVehicle: null });
      },
      getTotalPrice: () => {
        const total = get().items.reduce((sum, item) => {
          // Extract numeric value from price string
          // Handle formats: "£400", "£100-150", "£1000-£2000"
          const priceStr = item.price.replace(/£/g, '').trim();
          
          // Check if it's a range (e.g., "100-150" or "1000-2000")
          if (priceStr.includes('-')) {
            const [min, max] = priceStr.split('-').map(s => parseInt(s.trim()) || 0);
            // Use average for range, or max if we want to be conservative
            const price = Math.round((min + max) / 2);
            return sum + price;
          } else {
            // Single price
            const price = parseInt(priceStr) || 0;
            return sum + price;
          }
        }, 0);
        return `£${total.toFixed(2)}`;
      },
      getItemCount: () => {
        return get().items.length;
      },
      checkAndClearForNewVehicle: (brand: string, model: string, year: string) => {
        const vehicleKey = `${brand}-${model}-${year}`;
        const currentVehicle = get().currentVehicle;
        
        // If vehicle changed, clear cart
        if (currentVehicle !== null && currentVehicle !== vehicleKey) {
          set({ items: [], currentVehicle: vehicleKey });
        } else if (currentVehicle === null) {
          // First time setting vehicle
          set({ currentVehicle: vehicleKey });
        }
      },
    }),
    {
      name: 'britline-jlr-cart',
    }
  )
);

