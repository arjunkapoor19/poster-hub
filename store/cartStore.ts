// store/cartStore.ts

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

// Define the type for a single item in the cart
export type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

// Define the type for the store's state and actions
export type CartState = {
  cart: CartItem[]
  isCartOpen: boolean
  
  // Actions
  addToCart: (item: CartItem) => void
  removeFromCart: (itemId: string) => void // Removes an item line completely
  decreaseQuantity: (itemId: string) => void // Decreases quantity by 1
  clearCart: () => void
  openCart: () => void // Explicitly opens the cart
  closeCart: () => void // Explicitly closes the cart

  // Derived state (getters)
  getCartTotal: () => number
  getCartItemCount: () => number
}

// Create the Zustand store with localStorage persistence
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // --- STATE ---
      cart: [],
      isCartOpen: false,

      // --- ACTIONS ---

      // Explicitly opens the cart drawer/sheet
      openCart: () => set({ isCartOpen: true }),

      // Explicitly closes the cart drawer/sheet
      closeCart: () => set({ isCartOpen: false }),

      /**
       * Adds a new item to the cart. If the item already exists, 
       * it increases its quantity by the quantity of the new item (usually 1).
       */
      addToCart: (newItem) => {
        const { cart } = get()
        const existingItem = cart.find((item) => item.id === newItem.id)

        let updatedCart: CartItem[]
        if (existingItem) {
          // If item exists, map over the cart and update the quantity of the matching item
          updatedCart = cart.map((item) =>
            item.id === newItem.id
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          )
        } else {
          // If item doesn't exist, add it to the cart array
          updatedCart = [...cart, newItem]
        }

        set({ cart: updatedCart })
      },
      
      /**
       * Decreases the quantity of a specific item by 1. 
       * If the quantity reaches 0, the item is removed from the cart.
       */
      decreaseQuantity: (itemId) => {
        set((state) => ({
          cart: state.cart
            .map((item) =>
              item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
            )
            .filter((item) => item.quantity > 0), // Filter out items with quantity 0
        }))
      },

      /**
       * Completely removes an item and all its quantity from the cart, 
       * regardless of its quantity.
       */
      removeFromCart: (itemId) => {
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== itemId),
        }))
      },
      
      /**
       * Clears all items from the cart.
       */
      clearCart: () => set({ cart: [] }),

      // --- DERIVED STATE (GETTERS) ---
      
      /**
       * Calculates the total price of all items in the cart.
       * @returns {number} The total price.
       */
      getCartTotal: () => {
        const { cart } = get()
        return cart.reduce((total, item) => total + item.price * item.quantity, 0)
      },
      
      /**
       * Calculates the total number of individual items in the cart.
       * @returns {number} The total item count.
       */
      getCartItemCount: () => {
        const { cart } = get()
        return cart.reduce((total, item) => total + item.quantity, 0)
      },
    }),
    {
      // Configuration for persistence middleware
      name: "wallstreet-cart-storage", // A unique name for your app's cart in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)