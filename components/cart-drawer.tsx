"use client"

import { useCartStore } from "@/store/cartStore"
import { useCartDrawerStore } from "@/store/cartDrawerStore"
import { motion } from "framer-motion"
import { X, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import CheckoutSection from "./checkout-section"

const CartDrawer = () => {
  const { cart, addToCart, removeFromCart} = useCartStore()
  const { isOpen, closeDrawer } = useCartDrawerStore()

  // Calculate total price
  const totalPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const discount = totalPrice * 0.4

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: isOpen ? "0%" : "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 w-full max-w-md h-full bg-white shadow-xl p-6 z-50 overflow-y-auto"
    >
      {/* Cart Header */}
      <div className="flex justify-between items-center pb-4 border-b">
        <h2 className="text-xl font-semibold">Cart</h2>
        <Button variant="ghost" size="icon" onClick={closeDrawer}>
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Cart Items */}
      {cart.length === 0 ? (
        <p className="text-center mt-5 text-gray-600">Your cart is empty.</p>
      ) : (
        <div className="mt-4 space-y-6">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
              {/* Image */}
              <div className="w-20 h-24 relative bg-gray-100">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="flex-grow">
                <h3 className="font-medium text-sm">{item.name}</h3>
                <p className="text-sm text-gray-500"><span className="line-through">₹{item.price+((item.price)*0.4)}</span> <span className="text-black">₹{item.price}</span></p>

                {/* Quantity Selector */}
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => item.quantity > 1 ? removeFromCart(item.id) : null}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-semibold">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addToCart({ ...item, quantity: 1 })}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Remove Button */}
              <Button
                onClick={() => removeFromCart(item.id)}
                size="icon"
                variant="ghost"
                className="text-gray-500 hover:text-red-500"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Cart Footer */}
      {cart.length > 0 && (
        <div className="mt-6 space-y-3">
          {/* Discount */}
          <div className="flex justify-between text-sm text-gray-500">
            <span>Discount</span>
            <span className="text-red-500">-₹{discount.toFixed(2)}</span>
          </div>

          {/* Total Price */}
          <div className="flex justify-between text-lg font-semibold">
            <span>Total</span>
            <span>₹{totalPrice}</span>
          </div>

          {/* Checkout Button */}
          <CheckoutSection />

          {/* Continue Shopping */}
          <Button className="w-full mt-2" variant="outline" onClick={closeDrawer}>
            Continue Shopping
          </Button>
        </div>
      )}
    </motion.div>
  )
}

export default CartDrawer
