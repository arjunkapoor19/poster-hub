"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useCartStore } from "@/store/cartStore"
import { supabase } from "@/lib/supabaseClient"
// If you don't have toast component, uncomment the import below:
// import { toast } from "@/components/ui/use-toast"

export default function CheckoutPage() {
  const router = useRouter()
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)
  const [loading, setLoading] = useState(false)
  const { cart, clearCart } = useCartStore()
  
  // Form states
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [pinCode, setPinCode] = useState("")
  const [phone, setPhone] = useState("")
  const [shippingMethod, setShippingMethod] = useState("prepaid")

  // Calculate cart total
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = shippingMethod === "cod" ? 149 : 0
  const orderTotal = cartTotal + shippingCost

  const handleSubmitOrder = async () => {
    // Basic validation
    if (!firstName || !lastName || !address || !city || !state || !pinCode || !phone) {
      alert("Please fill all required fields")
      return
    }

    // Check if cart is empty
    if (cart.length === 0) {
      alert("Your cart is empty")
      return
    }

    setLoading(true)

    try {
      // Get current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        alert("You must be logged in to place an order")
        setLoading(false)
        return
      }

      // Create shipping address object
      const shippingAddress = {
        firstName,
        lastName,
        address,
        city,
        state,
        pinCode,
        phone
      }

      // Create order in database
      const { error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          // --- MODIFICATION: Standardize the 'items' payload ---
          // We now only send the product_id and quantity, not the name and price.
          items: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity
          })),
          status: "Processing",
          shipping_address: shippingAddress,
          shipping_method: shippingMethod,
          shipping_cost: shippingCost,
          subtotal: cartTotal,
          total_amount: orderTotal,
          created_at: new Date().toISOString()
        })

      if (orderError) {
        console.error("Error creating order:", orderError)
        alert(`Error creating your order: ${orderError.message}. Please try again.`)
        setLoading(false)
        return
      }

      // Clear the cart after successful order
      clearCart()
      
      // Show success message and redirect
      alert("Order placed successfully! You will receive a confirmation email shortly.")
      
      // Redirect to success page or orders page
      router.push("/profile")
    } catch (error: any) {
      console.error("Order submission error:", error)
      alert(`An unexpected error occurred: ${error?.message || 'Unknown error'}. Please try again.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4">
      <Header />
      
      <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6 max-w-6xl mx-auto">
        {/* Left column - Form */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Account Info */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold">Account</h2>
            <p className="text-sm text-gray-500">01arjunkapoor@gmail.com</p>
          </Card>

          {/* Delivery Section */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold">Delivery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <Input placeholder="First Name *" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              <Input placeholder="Last Name *" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              <Input placeholder="Address *" className="md:col-span-2" value={address} onChange={(e) => setAddress(e.target.value)} required />
              <Input placeholder="City *" value={city} onChange={(e) => setCity(e.target.value)} required />
              <Input placeholder="State *" value={state} onChange={(e) => setState(e.target.value)} required />
              <Input placeholder="PIN Code *" value={pinCode} onChange={(e) => setPinCode(e.target.value)} required />
              <Input placeholder="Phone Number *" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
          </Card>

          {/* Shipping Method */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold">Shipping Method</h2>
            <RadioGroup defaultValue="prepaid" value={shippingMethod} onValueChange={setShippingMethod}>
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="prepaid" id="prepaid" />
                <label htmlFor="prepaid" className="text-sm">Prepaid - Free Express Shipping (3-5 Days)</label>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <RadioGroupItem value="cod" id="cod" />
                <label htmlFor="cod" className="text-sm">COD - Standard Shipping (6-8 Days) ₹149.00</label>
              </div>
            </RadioGroup>
          </Card>

          {/* Payment Section */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold">Payment</h2>
            <p className="text-sm text-gray-500 mb-3">All transactions are secure and encrypted.</p>
            <div className="flex justify-between items-center bg-gray-100 p-3 rounded-md">
              <p className="text-sm">PhonePe Payment Gateway (UPI, Cards & NetBanking)</p>
            </div>
          </Card>

          {/* Billing Address */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold">Billing Address</h2>
            <div className="flex items-center space-x-2 mt-2">
              <Checkbox checked={billingSameAsShipping} onCheckedChange={() => setBillingSameAsShipping(!billingSameAsShipping)} id="billingSame" />
              <label htmlFor="billingSame" className="text-sm">Same as shipping address</label>
            </div>
          </Card>
        </div>
        
        {/* Right column - Order Summary */}
        <div className="w-full md:w-96">
          <Card className="p-4 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>Shipping</span>
                <span>{shippingMethod === "cod" ? "₹149" : "Free"}</span>
              </div>
              <div className="flex justify-between font-bold mt-3 pt-3 border-t">
                <span>Total</span>
                <span>₹{orderTotal}</span>
              </div>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-lg text-lg mt-4" onClick={handleSubmitOrder} disabled={loading}>
              {loading ? "Processing..." : "Place Order"}
            </Button>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}