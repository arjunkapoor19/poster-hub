import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

// Define cart item type
type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
}

// Define store state and actions
type CartState = {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
}

// Zustand store with localStorage persistence
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (item) => {
        const updatedCart = [...get().cart]
        const existingItemIndex = updatedCart.findIndex((cartItem) => cartItem.id === item.id)

        if (existingItemIndex !== -1) {
          updatedCart[existingItemIndex].quantity += 1
        } else {
          updatedCart.push(item)
        }

        set({ cart: updatedCart })
      },
      removeFromCart: (id) => {
        set({ cart: get().cart.filter((item) => item.id !== id) })
      },
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "cart-storage", // Key for localStorage
      storage: createJSONStorage(() => localStorage), // Use localStorage
    }
  )
)
