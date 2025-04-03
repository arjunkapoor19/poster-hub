"use client"

import { useCartStore } from "@/store/cartStore"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartDrawerStore } from "@/store/cartDrawerStore"

const CartDrawer = () => {
  const { cart, removeFromCart, clearCart } = useCartStore()
  const { isOpen, closeDrawer } = useCartDrawerStore()

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: isOpen ? "0%" : "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 w-80 h-full bg-white shadow-lg p-4 z-50 overflow-y-auto"
    >
      <div className="flex justify-between items-center border-b pb-3">
        <h2 className="text-xl font-semibold">Your Cart</h2>
        <Button variant="ghost" size="icon" onClick={closeDrawer}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {cart.length === 0 ? (
        <p className="text-center mt-5">Your cart is empty.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center border-b pb-2">
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-gray-500">${item.price} x {item.quantity}</p>
              </div>
              <Button size="sm" variant="destructive" onClick={() => removeFromCart(item.id)}>
                Remove
              </Button>
            </div>
          ))}
          <Button className="w-full mt-4" variant="secondary" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>
      )}
    </motion.div>
  )
}

export default CartDrawer
