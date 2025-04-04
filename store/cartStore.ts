import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

// Define cart item type
type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

// Define store state and actions
type CartState = {
  cart: CartItem[]
  isCartOpen: boolean // Track cart visibility
  toggleCart: () => void
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
}

// Zustand store with localStorage persistence
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],
      isCartOpen: false, // Cart is initially closed
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

      addToCart: (newItem) => {
        set((state) => {
          const updatedCart = [...state.cart]
          const existingItemIndex = updatedCart.findIndex((item) => item.id === newItem.id)

          if (existingItemIndex !== -1) {
            // ✅ Increase the quantity correctly
            updatedCart[existingItemIndex].quantity += newItem.quantity
          } else {
            // ✅ Add the item if it's not in the cart
            updatedCart.push(newItem)
          }

          return { cart: updatedCart }
        })
      },

      removeFromCart: (id) => {
        set({ cart: get().cart.filter((item) => item.id !== id) })
      },

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
)
