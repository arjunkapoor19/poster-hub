// src/app/order-success/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { supabase } from "@/lib/supabaseClient"
import { CheckCircle, Package, Clock, Truck, Mail, Phone, MapPin, CreditCard, Banknote } from 'lucide-react'
import Link from "next/link"

interface OrderDetails {
  id: string;
  merchant_transaction_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    name: string;
    price: number;
  }>;
  status: string;
  shipping_address: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    pinCode: string;
    phone: string;
  };
  shipping_method: string;
  shipping_cost: number;
  subtotal: number;
  total_amount: number;
  created_at: string;
  payment_id?: string;
  razorpay_order_id?: string;
}

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  const paymentId = searchParams.get('payment_id')
  const paymentMethod = searchParams.get('payment_method')
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError("Order ID not found")
        setLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("merchant_transaction_id", orderId)
          .single()

        if (error) {
          console.error("Error fetching order:", error)
          setError("Failed to fetch order details")
        } else {
          // Parse the shipping_address JSON string
          let processedData = { ...data }
          if (typeof data.shipping_address === 'string') {
            try {
              processedData.shipping_address = JSON.parse(data.shipping_address)
              console.log("Parsed shipping address:", processedData.shipping_address)
            } catch (parseError) {
              console.error("Error parsing shipping address:", parseError)
              processedData.shipping_address = {}
            }
          }
          
          // Debug log to check the data structure
          console.log("Order data received:", processedData)
          setOrderDetails(processedData)
        }
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !orderDetails) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gray-100 p-8 rounded-lg border border-gray-300">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h1>
              <p className="text-gray-600 mb-6">{error || "We couldn't find your order details."}</p>
              <Link href="/products">
                <Button className="bg-black hover:bg-gray-800 text-white">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const isPrepaid = orderDetails.shipping_method === "prepaid"
  const estimatedDelivery = new Date()
  estimatedDelivery.setDate(estimatedDelivery.getDate() + (isPrepaid ? 5 : 8))

  // Safe access to shipping address with fallbacks
  const shippingAddress = orderDetails.shipping_address || {}
  const {
    firstName = '',
    lastName = '',
    address = '',
    city = '',
    state = '',
    pinCode = '',
    phone = ''
  } = shippingAddress

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-6">
              <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-black mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600 text-lg">
              Thank you for your purchase. Your order has been successfully placed.
            </p>
          </div>

          {/* Order Summary Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Order Details */}
            <Card className="p-6 border-2 border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <Package className="h-6 w-6 text-black" />
                <h2 className="text-xl font-bold text-black">Order Details</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-mono text-sm bg-gray-100 p-2 rounded border">{orderDetails.merchant_transaction_id}</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant="outline" className="border-black text-black">
                    {orderDetails.status}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Payment Method</span>
                  <div className="flex items-center space-x-2">
                    {isPrepaid ? (
                      <>
                        <CreditCard className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">Online Payment</span>
                      </>
                    ) : (
                      <>
                        <Banknote className="h-4 w-4 text-gray-600" />
                        <span className="text-sm">Cash on Delivery</span>
                      </>
                    )}
                  </div>
                </div>

                {paymentId && (
                  <div>
                    <p className="text-sm text-gray-600">Payment ID</p>
                    <p className="font-mono text-xs bg-gray-100 p-2 rounded border">{paymentId}</p>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Order Date</span>
                  <span className="text-sm">{new Date(orderDetails.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>

            {/* Delivery Information */}
            <Card className="p-6 border-2 border-gray-200">
              <div className="flex items-center space-x-3 mb-6">
                <Truck className="h-6 w-6 text-black" />
                <h2 className="text-xl font-bold text-black">Delivery Info</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-600 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                    <div className="text-sm">
                      {firstName || lastName ? (
                        <p className="font-medium">{firstName} {lastName}</p>
                      ) : (
                        <p className="font-medium text-gray-400">Name not available</p>
                      )}
                      {address ? (
                        <p>{address}</p>
                      ) : (
                        <p className="text-gray-400">Address not available</p>
                      )}
                      {city || state || pinCode ? (
                        <p>{city}{city && ', '}{state} {pinCode}</p>
                      ) : (
                        <p className="text-gray-400">City/State not available</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    {phone ? (
                      <p className="text-sm font-medium">{phone}</p>
                    ) : (
                      <p className="text-sm font-medium text-gray-400">Phone not available</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Estimated Delivery</p>
                    <p className="text-sm font-medium">{estimatedDelivery.toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">
                      {isPrepaid ? "3-5 business days" : "6-8 business days"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Order Items */}
          <Card className="p-6 border-2 border-gray-200 mb-8">
            <h2 className="text-xl font-bold text-black mb-6">Order Items</h2>
            
            <div className="space-y-4">
              {orderDetails.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-black">{item.name}</h3>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-black">₹{(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-xs text-gray-600">₹{item.price} each</p>
                  </div>
                </div>
              )) || <p className="text-gray-400">No items found</p>}
            </div>

            {/* Order Totals */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{orderDetails.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{orderDetails.shipping_cost > 0 ? `₹${orderDetails.shipping_cost.toFixed(2)}` : "FREE"}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-black pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>₹{orderDetails.total_amount?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="p-6 border-2 border-gray-200 mb-8">
            <h2 className="text-xl font-bold text-black mb-6">What happens next?</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-black">Order Confirmation</h3>
                  <p className="text-sm text-gray-600">You'll receive an email confirmation shortly with your order details.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-black">Order Processing</h3>
                  <p className="text-sm text-gray-600">We'll prepare your order for shipment within 1-2 business days.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-gray-600">Shipping & Delivery</h3>
                  <p className="text-sm text-gray-600">Track your package and receive it at your doorstep.</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button variant="outline" className="w-full sm:w-auto border-2 border-black text-black hover:bg-black hover:text-white">
                Continue Shopping
              </Button>
            </Link>
            <Link href="/profile">
              <Button className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white">
                Track Order
              </Button>
            </Link>
          </div>

          {/* Support Information */}
          <div className="text-center mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Mail className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">Need help?</span>
            </div>
            <p className="text-sm text-gray-600">
              Contact our support team at{" "}
              <a href="mailto:poster.biz@gmail.com" className="text-black hover:underline">
                poster.biz@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  )
}