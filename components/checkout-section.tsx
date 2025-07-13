// components/checkout-section.tsx

"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// 1. Import your cart drawer store
import { useCartDrawerStore } from "@/store/cartDrawerStore"

const shakeVariant = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.5 },
  },
}

const CheckoutSection = () => {
  const [isChecked, setIsChecked] = useState(false)
  const [shake, setShake] = useState(false)
  const router = useRouter()

  // 2. Get the closeDrawer function from the store
  const { closeDrawer } = useCartDrawerStore()

  const handleCheckout = () => {
    if (!isChecked) {
      setShake(true)
      setTimeout(() => setShake(false), 1000)
      return
    }

    // 3. Call closeDrawer() BEFORE navigating
    closeDrawer()
    
    router.push("/checkout")
  }

  return (
    <TooltipProvider>
      <div className="mt-4 space-y-4">
        <Tooltip open={shake}>
          <TooltipTrigger asChild>
            <motion.div
              variants={shakeVariant}
              animate={shake ? "shake" : ""}
              className="flex items-center"
            >
              <Checkbox
                id="terms"
                checked={isChecked}
                onCheckedChange={(val) => setIsChecked(val === true)}
              />
              <span className="font-normal pl-2">
                I agree to all
                <Link href="/T&C" className="font-bold hover:underline pl-1">
                  Terms and Conditions
                </Link>
              </span>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent
            side="top"
            sideOffset={12}
            className="bg-red-500 text-white text-sm px-3 py-1 rounded-md shadow-md"
            >   
            Please agree to terms
            </TooltipContent>

            </Tooltip>  
        
        <Button
          onClick={handleCheckout}
          className="w-full mt-4 bg-black text-white"
        >
          Checkout
        </Button>
      </div>
    </TooltipProvider>
  )
}

export default CheckoutSection