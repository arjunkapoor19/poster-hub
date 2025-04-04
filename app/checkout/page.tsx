// app/checkout/page.tsx
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function CheckoutPage() {
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)

  return (
    <div className="container mx-auto px-4">
        <Header />
    
    <div className="flex flex-col gap-4 p-4 md:p-6 max-w-lg mx-auto">
        
      {/* Account Info */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold">Account</h2>
        <p className="text-sm text-gray-500">01arjunkapoor@gmail.com</p>
      </Card>

      {/* Delivery Section */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold">Delivery</h2>
        <div className="grid grid-cols-1 gap-3 mt-2">
          <Input placeholder="First Name" />
          <Input placeholder="Last Name" />
          <Input placeholder="Address" />
          <Input placeholder="City" />
          <Input placeholder="State" />
          <Input placeholder="PIN Code" />
          <Input placeholder="Phone Number" />
        </div>
      </Card>

      {/* Shipping Method */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold">Shipping Method</h2>
        <RadioGroup defaultValue="prepaid">
          <div className="flex items-center space-x-2 mt-2">
            <RadioGroupItem value="prepaid" id="prepaid" />
            <label htmlFor="prepaid" className="text-sm">
              Prepaid - Free Express Shipping (3-5 Days)
            </label>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <RadioGroupItem value="cod" id="cod" />
            <label htmlFor="cod" className="text-sm">
              COD - Standard Shipping (6-8 Days) ₹149.00
            </label>
          </div>
        </RadioGroup>
      </Card>

      {/* Payment Section */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold">Payment</h2>
        <p className="text-sm text-gray-500 mb-3">
          All transactions are secure and encrypted.
        </p>
        <div className="flex justify-between items-center bg-gray-100 p-3 rounded-md">
          <p className="text-sm">PhonePe Payment Gateway (UPI, Cards & NetBanking)</p>
          
        </div>
      </Card>

      {/* Billing Address */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold">Billing Address</h2>
        <div className="flex items-center space-x-2 mt-2">
          <Checkbox
            checked={billingSameAsShipping}
            onCheckedChange={() => setBillingSameAsShipping(!billingSameAsShipping)}
            id="billingSame"
          />
          <label htmlFor="billingSame" className="text-sm">
            Same as shipping address
          </label>
        </div>
      </Card>

      {/* Pay Now Button */}
      <Button className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg">
        Pay Now
      </Button>
    </div>
    <Footer />
    </div>
  )
}
