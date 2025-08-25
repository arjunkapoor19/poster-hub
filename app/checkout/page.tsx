// src/app/checkout/page.tsx

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { useCartStore } from "@/store/cartStore"
import { supabase } from "@/lib/supabaseClient"
import Script from "next/script"
import { v4 as uuidv4 } from 'uuid'
import { Shield, Lock, Clock, Truck, Check, Star, Users, ArrowRight, AlertCircle, LogIn, ShoppingCart } from 'lucide-react'

declare const Razorpay: any;

interface ModalState {
  isOpen: boolean;
  type: 'validation' | 'auth_required' | 'empty_cart' | 'order_error' | 'payment_error' | 'payment_cancelled';
  title: string;
  message: string;
  primaryAction?: () => void;
  primaryActionText?: string;
  secondaryAction?: () => void;
  secondaryActionText?: string;
}

export default function CheckoutPage() {
  const router = useRouter()
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true)
  const [loading, setLoading] = useState(false)
  const { cart, clearCart } = useCartStore()
  
  // Modal state
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: 'validation',
    title: '',
    message: ''
  });

  // Form states
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [pinCode, setPinCode] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [shippingMethod, setShippingMethod] = useState("prepaid")

  // Social proof and stock states
  const [recentOrders, setRecentOrders] = useState(247)
  const [stockStatus, setStockStatus] = useState<{[key: string]: number}>({})

  // Helper function to show modals
  const showModal = (modalData: Partial<ModalState>) => {
    setModal({
      isOpen: true,
      type: 'validation',
      title: '',
      message: '',
      ...modalData
    });
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

  // Load saved form data from localStorage
  useEffect(() => {
    const loadSavedData = () => {
      try {
        const savedData = localStorage.getItem('checkout_form_data');
        if (savedData) {
          const parsed = JSON.parse(savedData);
          setFirstName(parsed.firstName || "");
          setLastName(parsed.lastName || "");
          setAddress(parsed.address || "");
          setCity(parsed.city || "");
          setState(parsed.state || "");
          setPinCode(parsed.pinCode || "");
          setPhone(parsed.phone || "");
          setShippingMethod(parsed.shippingMethod || "prepaid");
        }
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    };

    const getUserDetails = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || "");
        
        // Only set name from user metadata if no saved data exists
        const savedData = localStorage.getItem('checkout_form_data');
        if (!savedData) {
          const fullName = user.user_metadata?.full_name;
          if (fullName) {
            const nameParts = fullName.split(' ');
            setFirstName(nameParts[0] || "");
            if (nameParts.length > 1) {
              setLastName(nameParts.slice(1).join(' '));
            }
          }
        }
      }
    };

    loadSavedData();
    getUserDetails();

    // Simulate stock levels for urgency
    const mockStock: {[key: string]: number} = {};
    cart.forEach(item => {
      mockStock[item.id] = Math.floor(Math.random() * 8) + 2; // 2-9 items left
    });
    setStockStatus(mockStock);

    // Simulate recent orders counter
    const orderTimer = setInterval(() => {
      setRecentOrders(prev => prev + Math.floor(Math.random() * 3));
    }, 15000);

    return () => {
      clearInterval(orderTimer);
    };
  }, [cart]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    const formData = {
      firstName,
      lastName,
      address,
      city,
      state,
      pinCode,
      phone,
      shippingMethod
    };
    
    // Only save if at least one field has content
    if (Object.values(formData).some(value => value && value.trim() !== '')) {
      try {
        localStorage.setItem('checkout_form_data', JSON.stringify(formData));
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    }
  }, [firstName, lastName, address, city, state, pinCode, phone, shippingMethod]);

  // Calculate cart total
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingCost = shippingMethod === "cod" ? 149 : 0
  const savings = cartTotal > 999 ? 299 : 0 // Free shipping savings
  const orderTotal = cartTotal + shippingCost

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Clear saved form data after successful order
  const clearSavedFormData = () => {
    try {
      localStorage.removeItem('checkout_form_data');
    } catch (error) {
      console.error('Error clearing saved form data:', error);
    }
  };

  const handlePayment = async () => {
    // Validation with modal instead of alert
    const requiredFields = [
      { value: firstName, name: "First Name", field: "firstName" },
      { value: lastName, name: "Last Name", field: "lastName" },
      { value: address, name: "Address", field: "address" },
      { value: city, name: "City", field: "city" },
      { value: state, name: "State", field: "state" },
      { value: pinCode, name: "PIN Code", field: "pinCode" },
      { value: phone, name: "Phone Number", field: "phone" }
    ];

    const missingField = requiredFields.find(field => !field.value);
    if (missingField) {
      showModal({
        type: 'validation',
        title: 'Missing Information',
        message: `Please enter your ${missingField.name} to continue with your order.`,
        primaryActionText: 'Got it',
        primaryAction: closeModal
      });
      return;
    }

    if (cart.length === 0) {
      showModal({
        type: 'empty_cart',
        title: 'Cart is Empty',
        message: 'Your cart is empty. Please add some items before proceeding to checkout.',
        primaryActionText: 'Browse Products',
        primaryAction: () => {
          closeModal();
          router.push('/products');
        },
        secondaryActionText: 'Close',
        secondaryAction: closeModal
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false);
        showModal({
          type: 'auth_required',
          title: 'Sign In Required',
          message: 'Please sign in to your account to complete your order. Your cart items will be saved.',
          primaryActionText: 'Sign In',
          primaryAction: () => {
            closeModal();
            router.push('/login?redirect=/checkout');
          }
        });
        return;
      }

      const merchantTransactionId = uuidv4();
      const shippingAddress = { firstName, lastName, address, city, state, pinCode, phone };
      
      const { error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          items: cart.map(item => ({ product_id: item.id, quantity: item.quantity, name: item.name, price: item.price })),
          status: "Pending Payment",
          shipping_address: shippingAddress,
          shipping_method: shippingMethod,
          shipping_cost: shippingCost,
          subtotal: cartTotal,
          total_amount: orderTotal,
          merchant_transaction_id: merchantTransactionId,
          created_at: new Date().toISOString()
        });

      if (orderError) {
        setLoading(false);
        showModal({
          type: 'order_error',
          title: 'Order Creation Failed',
          message: `We couldn't create your order at this time. ${orderError.message}. Please try again or contact support if the problem persists.`,
          primaryActionText: 'Try Again',
          primaryAction: () => {
            closeModal();
            handlePayment();
          },
          secondaryActionText: 'Contact Support',
          secondaryAction: () => {
            closeModal();
            router.push('/contact');
          }
        });
        return;
      }
      
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            amount: orderTotal * 100,
            merchant_transaction_id: merchantTransactionId 
        }),
      });
      
      const razorpayData = await response.json();

      if (!razorpayData.success) {
        setLoading(false);
        showModal({
          type: 'payment_error',
          title: 'Payment Setup Failed',
          message: `We couldn't initiate the payment process. ${razorpayData.message}. Please try again or contact support.`,
          primaryActionText: 'Try Again',
          primaryAction: () => {
            closeModal();
            handlePayment();
          },
          secondaryActionText: 'Contact Support',
          secondaryAction: () => {
            closeModal();
            router.push('/contact');
          }
        });
        return;
      }
      
      const { order: razorpayOrder } = razorpayData;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "Your Awesome Store",
        description: `Order ID: ${merchantTransactionId}`,
        order_id: razorpayOrder.id,
        handler: function (response: any) {
            clearSavedFormData(); // Clear saved data on successful payment
            clearCart();
            router.push(`/order-success?payment_id=${response.razorpay_payment_id}&order_id=${merchantTransactionId}`);
        },
        prefill: {
            name: `${firstName} ${lastName}`,
            email: email,
            contact: phone,
        },
        notes: {
            merchant_transaction_id: merchantTransactionId,
            shippingAddress: JSON.stringify(shippingAddress)
        },
        theme: {
            color: "#2563eb",
        },
        modal: {
            ondismiss: function() {
                console.log("Checkout form closed by user.");
                setLoading(false);
                showModal({
                  type: 'payment_cancelled',
                  title: 'Payment Cancelled',
                  message: 'Your payment was cancelled. Your order is still saved and you can complete the payment anytime.',
                  primaryActionText: 'Try Again',
                  primaryAction: () => {
                    closeModal();
                    handlePayment();
                  },
                  secondaryActionText: 'Continue Shopping',
                  secondaryAction: () => {
                    closeModal();
                    router.push('/products');
                  }
                });
            }
        }
      };

      const rzpInstance = new Razorpay(options);
      rzpInstance.open();

    } catch (error: any) {
      console.error("An unexpected error occurred:", error);
      setLoading(false);
      showModal({
        type: 'payment_error',
        title: 'Unexpected Error',
        message: `An unexpected error occurred: ${error?.message || 'Unknown error'}. Please try again or contact our support team.`,
        primaryActionText: 'Try Again',
        primaryAction: () => {
          closeModal();
          handlePayment();
        },
        secondaryActionText: 'Contact Support',
        secondaryAction: () => {
          closeModal();
          router.push('/contact');
        }
      });
    }
  }

  // Get appropriate icon for modal type
  const getModalIcon = () => {
    switch (modal.type) {
      case 'auth_required':
        return <LogIn className="h-6 w-6 text-blue-600" />;
      case 'empty_cart':
        return <ShoppingCart className="h-6 w-6 text-orange-600" />;
      case 'validation':
        return <AlertCircle className="h-6 w-6 text-amber-600" />;
      case 'order_error':
      case 'payment_error':
        return <AlertCircle className="h-6 w-6 text-red-600" />;
      case 'payment_cancelled':
        return <AlertCircle className="h-6 w-6 text-gray-600" />;
      default:
        return <AlertCircle className="h-6 w-6 text-blue-600" />;
    }
  };

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />

      {/* Modal Component */}
      <Dialog open={modal.isOpen} onOpenChange={closeModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center space-x-3 mb-2">
              {getModalIcon()}
              <DialogTitle className="text-lg font-semibold">
                {modal.title}
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-600">
              {modal.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            {modal.secondaryAction && modal.secondaryActionText && (
              <Button 
                variant="outline" 
                onClick={modal.secondaryAction}
                className="w-full sm:w-auto"
              >
                {modal.secondaryActionText}
              </Button>
            )}
            {modal.primaryAction && modal.primaryActionText && (
              <Button 
                onClick={modal.primaryAction}
                className="w-full sm:w-auto"
              >
                {modal.primaryActionText}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Header />
        
        {/* Trust Bar */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="h-4 w-4" />
                <span>Free Express Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>{recentOrders} orders today</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-600">Step 1: Order Details</span>
                <span className="text-sm text-gray-500">Almost there!</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full w-3/4 transition-all duration-300"></div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column - Forms */}
              <div className="flex-1 space-y-6">
                {/* Account Section */}
                <Card className="p-6 border-2 border-blue-100 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Account</h2>
                    <Check className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-green-800 font-medium">{email || "Loading..."}</p>
                    <p className="text-sm text-green-600 mt-1">✓ Verified account</p>
                  </div>
                </Card>

                {/* Delivery Section */}
                <Card className="p-6 border-2 border-blue-100 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Delivery Information</h2>
                    <Badge variant="outline" className="border-blue-200 text-blue-600">
                      Required
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">First Name *</label>
                      <Input 
                        placeholder="Enter first name" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)}
                        className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Last Name *</label>
                      <Input 
                        placeholder="Enter last name" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)}
                        className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-medium text-gray-700">Address *</label>
                      <Input 
                        placeholder="House number, street name, area" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)}
                        className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">City *</label>
                      <Input 
                        placeholder="Enter city" 
                        value={city} 
                        onChange={(e) => setCity(e.target.value)}
                        className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">State *</label>
                      <Input 
                        placeholder="Enter state" 
                        value={state} 
                        onChange={(e) => setState(e.target.value)}
                        className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">PIN Code *</label>
                      <Input 
                        placeholder="6-digit PIN" 
                        value={pinCode} 
                        onChange={(e) => setPinCode(e.target.value)}
                        className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Phone Number *</label>
                      <Input 
                        placeholder="10-digit mobile number" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        className="border-2 border-gray-200 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </Card>

                {/* Shipping Method */}
                <Card className="p-6 border-2 border-blue-100 shadow-lg">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Shipping Method</h2>
                  <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-4 border-2 border-green-200 rounded-lg bg-green-50">
                        <RadioGroupItem value="prepaid" id="prepaid" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <label htmlFor="prepaid" className="font-medium text-green-800">
                              Express Shipping - FREE
                            </label>
                            <Badge className="bg-green-600 text-white">Recommended</Badge>
                          </div>
                          <p className="text-sm text-green-600 mt-1">
                            ⚡ 3-5 business days • Free for prepaid orders
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg">
                        <RadioGroupItem value="cod" id="cod" />
                        <div className="flex-1">
                          <label htmlFor="cod" className="font-medium text-gray-700">
                            Cash on Delivery
                          </label>
                          <p className="text-sm text-gray-600 mt-1">
                            📦 6-8 business days • ₹149 shipping fee
                          </p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>
                </Card>

                {/* Payment Section */}
                <Card className="p-6 border-2 border-blue-100 shadow-lg">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Payment</h2>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3 mb-2">
                      <Lock className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Secure Payment via Razorpay</span>
                    </div>
                    <p className="text-sm text-blue-600">
                      UPI • Credit/Debit Cards • Net Banking • Wallets
                    </p>
                  </div>
                </Card>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:w-96">
                <Card className="p-6 border-2 border-blue-100 shadow-xl sticky top-4">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>
                  
                  {/* Cart Items */}
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">{item.name}</h3>
                          <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          {stockStatus[item.id] && stockStatus[item.id] <= 5 && (
                            <Badge variant="destructive" className="text-xs mt-1">
                              Only {stockStatus[item.id]} left!
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Totals */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className={shippingMethod === "prepaid" ? "text-green-600 font-medium" : ""}>
                        {shippingMethod === "cod" ? `₹${shippingCost.toFixed(2)}` : "FREE"}
                      </span>
                    </div>
                    {savings > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>You Save</span>
                        <span>₹{savings.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="border-t pt-3">
                      <div className="flex justify-between text-xl font-bold text-gray-800">
                        <span>Total</span>
                        <span>₹{orderTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {shippingMethod === "prepaid" ? (
                      <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 text-lg font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
                        onClick={handlePayment}
                        disabled={loading}
                      >
                        {loading ? (
                          "Processing..."
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <Lock className="h-5 w-5" />
                            <span>Complete Secure Payment</span>
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        )}
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white py-4 text-lg font-bold shadow-lg transform hover:scale-105 transition-all duration-200"
                        disabled={loading}
                      >
                        {loading ? (
                          "Processing..."
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <span>Place COD Order</span>
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Trust Indicators */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Shield className="h-4 w-4" />
                        <span>SSL Secured</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>4.9/5 Rating</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  )
}