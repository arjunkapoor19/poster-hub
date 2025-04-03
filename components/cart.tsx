"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCartStore } from "@/store/cartStore"

const Cart = () => {
  const { cart, addToCart, removeFromCart, clearCart } = useCartStore()
  const [total, setTotal] = useState(0)

  useEffect(() => {
    let sum = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
    setTotal(sum)
  }, [cart])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      {cart.length === 0 ? (
        <p className="text-lg">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center border-b pb-4">
                <Image
                  src={`/images/products/${item.id}.jpg`} // Adjust path as needed
                  alt={item.name}
                  width={80}
                  height={80}
                  className="rounded-md"
                />
                <div className="flex-1 ml-4">
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    onClick={() => addToCart({ ...item, quantity: 1 })}
                  >
                    +
                  </Button>
                  <span className="mx-2">{item.quantity}</span>
                  <Button
                    variant="outline"
                    onClick={() => removeFromCart(item.id)}
                  >
                    −
                  </Button>
                </div>
                <p className="ml-4 font-semibold">₹{item.price * item.quantity}</p>
                <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                  <Trash2 className="text-red-500" />
                </Button>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 text-lg">
            <p className="flex justify-between font-bold">
              <span>Total:</span> <span>₹{total}</span>
            </p>
          </div>
          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
            <Link href="/checkout">
              <Button variant="default" className="px-6">Checkout</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

export default Cart
