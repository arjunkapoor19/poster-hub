// components/cart-drawer.tsx

"use client"

import Image from "next/image"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash2 } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

import { useCartStore } from "@/store/cartStore"
import { useCartDrawerStore } from "@/store/cartDrawerStore"
import CheckoutSection from "./checkout-section"

export default function CartDrawer() {
  const { cart, addToCart, decreaseQuantity, removeFromCart, getCartTotal, getCartItemCount } = useCartStore()
  const { isDrawerOpen, closeDrawer } = useCartDrawerStore()

  const total = getCartTotal()
  const totalItems = getCartItemCount()

  return (
    <Sheet open={isDrawerOpen} onOpenChange={closeDrawer}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-lg">
        <SheetHeader className="border-b p-6 text-left">
          <SheetTitle className="text-xl font-bold">Your Cart ({totalItems})</SheetTitle>
        </SheetHeader>

        {/* CART CONTENT SECTION */}
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4">
              <div className="relative h-48 w-48 text-muted-foreground">
                <Image
                  src="/empty-cart.svg"
                  fill
                  alt="Empty shopping cart"
                />
              </div>
              <h3 className="text-xl font-semibold">Your cart is empty</h3>
              <p className="text-muted-foreground">Looks like you haven't added anything yet.</p>
              <Button onClick={closeDrawer}>Continue Shopping</Button>
            </div>
          ) : (
            <ScrollArea className="h-full">
              <div className="flex flex-col gap-8 p-6">
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
                      className="flex items-center justify-between gap-4"
                    >
                      {/* Image and Details */}
                      <div className="flex items-center gap-4">
                        <div className="relative h-28 w-20 flex-shrink-0 overflow-hidden rounded-md">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-base font-semibold">{item.name}</span>
                          <span className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</span>
                          <div className="mt-2 flex items-center">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => decreaseQuantity(item.id)}>
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-10 text-center text-base font-medium">{item.quantity}</span>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => addToCart({ ...item, quantity: 1 })}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      {/* Remove Button */}
                      <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}>
                        <Trash2 className="h-5 w-5 text-muted-foreground" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </div>

        {/* FOOTER / CHECKOUT SECTION */}
        {cart.length > 0 && (
          <div className="border-t p-6">
            <div className="mb-4 flex justify-between text-lg font-semibold">
              <span>Subtotal</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <CheckoutSection />
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}