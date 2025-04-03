import { create } from "zustand"

type CartDrawerState = {
  isOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

export const useCartDrawerStore = create<CartDrawerState>((set) => ({
  isOpen: false,
  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),
}))
