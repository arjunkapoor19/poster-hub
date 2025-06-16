// store/cartDrawerStore.ts

import { create } from 'zustand'

// Define the type for the store's state and actions
type CartDrawerState = {
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  toggleDrawer: () => void // Kept for flexibility, if needed
}

/**
 * This store is responsible for one thing only: managing the open/closed
 * state of the shopping cart drawer (Sheet). This separation of concerns
 * keeps our code clean.
 */
export const useCartDrawerStore = create<CartDrawerState>((set) => ({
  /**
   * STATE: The current visibility of the cart drawer.
   * Defaults to false (closed).
   */
  isDrawerOpen: false,

  /**
   * ACTION: Explicitly opens the cart drawer.
   * This is the primary action to call from components like the Header
   * or when adding an item to the cart.
   */
  openDrawer: () => set({ isDrawerOpen: true }),

  /**
   * ACTION: Explicitly closes the cart drawer.
   * This is used by the Sheet's `onOpenChange` event when the user
   * clicks the 'x', presses the Escape key, or clicks outside the drawer.
   */
  closeDrawer: () => set({ isDrawerOpen: false }),

  /**
   * ACTION: Toggles the current state of the drawer.
   * Useful for a simple open/close button if needed, but explicit
   * open/close actions are generally safer for complex interactions.
   */
  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
}))