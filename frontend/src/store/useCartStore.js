import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],

      addToCart: (item) => {
        const existItem = get().cartItems.find((x) => x.product === item.product && !x.isFreeGift);

        if (existItem) {
          set((state) => ({
            cartItems: state.cartItems.map((x) =>
              x.product === existItem.product && !x.isFreeGift ? item : x
            ),
          }));
        } else {
          set((state) => ({
            cartItems: [...state.cartItems, item],
          }));
        }
      },

      removeFromCart: (id) => {
        set((state) => ({
          cartItems: state.cartItems.filter((x) => !(x.product === id)),
        }));
      },

      // Adds the free gift as a regular cart item with price=0 and isFreeGift flag
      setFreeGift: (gift) => {
        const withoutGift = get().cartItems.filter(x => !x.isFreeGift);
        set({
          cartItems: [...withoutGift, { ...gift, price: 0, isFreeGift: true, quantity: 1 }]
        });
      },

      clearFreeGift: () => {
        set((state) => ({
          cartItems: state.cartItems.filter(x => !x.isFreeGift),
        }));
      },

      clearCart: () => {
        set({ cartItems: [] });
      },

      // Selector helper
      getFreeGift: () => get().cartItems.find(x => x.isFreeGift) || null,
    }),
    {
      name: 'atlas-kicks-cart',
    }
  )
);

export default useCartStore;
