import { create } from 'zustand';

const useCartAnimation = create((set) => ({
  animation: null,
  trigger: (image, fromRect) => {
    const cartEl = document.querySelector('[data-cart-icon]');
    const cartRect = cartEl ? cartEl.getBoundingClientRect() : null;
    if (!cartRect) return;
    set({
      animation: {
        image,
        startX: fromRect.left + fromRect.width / 2,
        startY: fromRect.top + fromRect.height / 2,
        endX: cartRect.left + cartRect.width / 2,
        endY: cartRect.top + cartRect.height / 2,
      },
    });
  },
  clear: () => set({ animation: null }),
}));

export default useCartAnimation;
