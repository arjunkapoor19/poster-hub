// components/ui/add-to-cart-modal.tsx

"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"

type AddToCartModalProps = {
  isOpen: boolean
}

export function AddToCartModal({ isOpen }: AddToCartModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-background p-8 shadow-2xl">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-lg font-medium">Added to Cart!</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}