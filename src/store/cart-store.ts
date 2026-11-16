import { create } from "zustand";

interface CartUiState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

// The bag's contents live on the server (useCart, through the Zcom kit, which also keeps the guest
// id); this store only says whether the drawer is open
export const useCartStore = create<CartUiState>()((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
