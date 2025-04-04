"use client"

import { useCartStore } from "@/store/cartStore"
import { motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
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
            <div key={item.id} className="flex gap-4 py-2 border-b last:border-0">
                <div className="w-20 h-24 relative bg-gray-100">
                                          {item.image ? (
                                            <Image
                                              src={item.image}
                                              alt={item.name}
                                              fill
                                              className="object-cover"
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                              No image
                                            </div>
                                          )}
                                        </div>
              <div className="flex-grow"> 
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-gray-500">₹{item.price} x {item.quantity}</p>
              </div>
    
              <Button onClick={() => removeFromCart(item.id)} size="icon" className="p-0 text-black bg-white hover:bg-gray-200 " >
                <X />
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
