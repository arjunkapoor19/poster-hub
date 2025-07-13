// src/app/checkout/page.tsx

"use client"

import { useState, useEffect } from "react"
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
import Script from "next/script"
import { v4 as uuidv4 } from 'uuid' // For generating unique IDs

// This line helps TypeScript recognize the Razorpay object from the script
declare const Razorpay: any;

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
  const [email, setEmail] = useState("") // Add email state for Razorpay prefill
  const [shippingMethod, setShippingMethod] = useState("prepaid")

  // Fetch user details on component mount for pre-filling forms
  useEffect(() => {
    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setEmail(user.email || "");
        }
    };
    getUser();
  }, []);

  // Calculate cart total
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = shippingMethod === "cod" ? 149 : 0
  const orderTotal = cartTotal + shippingCost

  const handlePayment = async () => {
    // 1. Basic Validation
    if (!firstName || !lastName || !address || !city || !state || !pinCode || !phone) {
      alert("Please fill all required delivery fields.")
      return
    }
    if (cart.length === 0) {
      alert("Your cart is empty.")
      return
    }

    setLoading(true)

    try {
      // 2. Get User
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert("You must be logged in to place an order.")
        setLoading(false)
        return
      }

      // 3. Generate a unique internal transaction ID
      const merchantTransactionId = uuidv4();

      // 4. Create the order in our database BEFORE payment
      const shippingAddress = { firstName, lastName, address, city, state, pinCode, phone };
      const { error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          items: cart.map(item => ({ product_id: item.id, quantity: item.quantity, name: item.name, price: item.price })),
          status: "Pending Payment", // Status is pending until webhook confirms
          shipping_address: shippingAddress,
          shipping_method: shippingMethod,
          shipping_cost: shippingCost,
          subtotal: cartTotal,
          total_amount: orderTotal,
          merchant_transaction_id: merchantTransactionId, // Our internal ID
          created_at: new Date().toISOString()
        });

      if (orderError) {
        alert(`Could not create your order: ${orderError.message}.`);
        setLoading(false);
        return;
      }
      
      // 5. Call our backend to create a Razorpay order
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            amount: orderTotal * 100, // Amount in the smallest currency unit (paise)
            merchant_transaction_id: merchantTransactionId 
        }),
      });
      
      const razorpayData = await response.json();

      if (!razorpayData.success) {
        alert(`Payment initiation failed: ${razorpayData.message}`);
        setLoading(false);
        return;
      }
      
      const { order: razorpayOrder } = razorpayData;

      // 6. Configure and open the Razorpay Checkout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Your Awesome Store", // <-- Replace with your store name
        description: `Order ID: ${merchantTransactionId}`,
        order_id: razorpayOrder.id,
        handler: function (response: any) {
            // This function is called on a successful payment.
            // The final status update is handled by the webhook for reliability.
            // Here, we can optimistically redirect the user.
            clearCart();
            router.push(`/order-success?payment_id=${response.razorpay_payment_id}&order_id=${merchantTransactionId}`);
        },
        prefill: {
            name: `${firstName} ${lastName}`,
            email: email,
            contact: phone,
        },
        notes: {
            // CRITICAL: This links the Razorpay payment to your internal order
            merchant_transaction_id: merchantTransactionId,
            shippingAddress: JSON.stringify(shippingAddress)
        },
        theme: {
            color: "#3399cc",
        },
        modal: {
            ondismiss: function() {
                // This is called when the user closes the payment modal without paying
                console.log("Checkout form closed by user.");
                alert("Payment was not completed.");
                setLoading(false);
            }
        }
      };

      const rzpInstance = new Razorpay(options);
      rzpInstance.open();

    } catch (error: any) {
      console.error("An unexpected error occurred:", error);
      alert(`An unexpected error occurred: ${error?.message || 'Unknown error'}.`);
      setLoading(false);
    }
  }

  return (
    <>
      {/* This Script component loads the Razorpay SDK asynchronously */}
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />

      <div className="container mx-auto px-4">
        <Header />
        
        <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6 max-w-6xl mx-auto">
          <div className="flex-1 flex flex-col gap-4">
            <Card className="p-4">
              <h2 className="text-lg font-semibold">Account</h2>
              {/* Display the fetched user email */}
              <p className="text-sm text-gray-500">{email || "Please log in"}</p>
            </Card>
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
            <Card className="p-4">
              <h2 className="text-lg font-semibold">Payment</h2>
              <p className="text-sm text-gray-500 mb-3">All transactions are secure and encrypted.</p>
              <div className="flex justify-between items-center bg-gray-100 p-3 rounded-md">
                {/* Updated payment method text */}
                <p className="text-sm">Pay via Razorpay (UPI, Cards, NetBanking)</p>
              </div>
            </Card>
            <Card className="p-4">
              <h2 className="text-lg font-semibold">Billing Address</h2>
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox checked={billingSameAsShipping} onCheckedChange={() => setBillingSameAsShipping(!billingSameAsShipping)} id="billingSame" />
                <label htmlFor="billingSame" className="text-sm">Same as shipping address</label>
              </div>
            </Card>
          </div>
          
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
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span>Shipping</span>
                  <span>{shippingMethod === "cod" ? `₹${shippingCost.toFixed(2)}` : "Free"}</span>
                </div>
                <div className="flex justify-between font-bold mt-3 pt-3 border-t">
                  <span>Total</span>
                  <span>₹{orderTotal.toFixed(2)}</span>
                </div>
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-lg text-lg mt-4"
                onClick={handlePayment}
                // Disable button for COD or when loading
                disabled={loading || shippingMethod === "cod"}
              >
                {loading ? "Processing..." : `Pay Securely ₹${orderTotal.toFixed(2)}`}
              </Button>
               {shippingMethod === 'cod' && (
                    <Button 
                        className="w-full bg-gray-700 hover:bg-gray-800 text-white py-6 rounded-lg text-lg mt-2"
                        // Add a separate handler for COD if needed
                        // onClick={handleCodOrder} 
                        disabled={loading}
                    >
                        Place Cash on Delivery Order
                    </Button>
                )}
            </Card>
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  )
}