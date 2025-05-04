"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Header from "@/components/header"
import { CalendarIcon, ShoppingBag, Package, Truck, CheckCircle, Clock } from "lucide-react"
import Footer from "@/components/footer"

type OrderItemRaw = {
  product_id: string
  quantity: number
}

type Product = {
  id: string
  title: string
  price: number
  image: string
}

type PopulatedOrderItem = Product & { quantity: number }

type Order = {
  id: string
  created_at: string
  status: string
  items: PopulatedOrderItem[]
}

const ProfilePage = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) return

      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (ordersError || !ordersData) return

      const allProductIds = new Set<string>()
      const parsedOrders = ordersData.map((order) => {
        const items: OrderItemRaw[] =
          typeof order.items === "string" ? JSON.parse(order.items) : order.items
        items.forEach((item) => allProductIds.add(item.product_id))
        return { ...order, items }
      })

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, title, price, image")
        .in("id", Array.from(allProductIds))

      if (productsError || !productsData) return

      const productMap = new Map<string, Product>()
      productsData.forEach((p) => productMap.set(p.id, p))

      const finalOrders: Order[] = parsedOrders.map((order) => ({
        id: order.id,
        created_at: order.created_at,
        status: order.status || "Processing", // Default status if not available
        items: order.items
          .map((item: OrderItemRaw) => {
            const product = productMap.get(item.product_id)
            if (!product) return null
            return { ...product, quantity: item.quantity }
          })
          .filter(Boolean) as PopulatedOrderItem[],
      }))

      setOrders(finalOrders)
      setLoading(false)
    }

    fetchOrders()
  }, [])

  // Format date in a nicer way
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  // Status badge component with appropriate icon and color
  const StatusBadge = ({ status }: { status: string }) => {
    // Determine icon and color based on status
    let icon, bgColor, textColor
    
    switch(status.toLowerCase()) {
      case 'delivered':
        icon = <CheckCircle className="w-3 h-3 mr-1" />
        bgColor = "bg-green-100"
        textColor = "text-green-800"
        break
      case 'shipped':
        icon = <Package className="w-3 h-3 mr-1" />
        bgColor = "bg-blue-100"
        textColor = "text-blue-800"
        break
      case 'out for delivery':
        icon = <Truck className="w-3 h-3 mr-1" />
        bgColor = "bg-yellow-100"
        textColor = "text-yellow-800"
        break
      case 'processing':
      default:
        icon = <Clock className="w-3 h-3 mr-1" />
        bgColor = "bg-gray-100"
        textColor = "text-gray-800"
        break
    }
    
    return (
      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
        {icon}
        {status}
      </div>
    )
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <ShoppingBag className="h-8 w-8 text-indigo-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-xl shadow-sm">
            <div className="text-indigo-600 text-lg">Loading your orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="text-center py-16 px-4">
              <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Your order history will appear here once you've made a purchase.
              </p>
              <button className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition-colors">
                Browse Store
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const total = order.items.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              )
              const itemCount = order.items.reduce(
                (sum, item) => sum + item.quantity, 
                0
              )

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 flex items-center">
                    <div className="flex-1">
                      <div className="text-xs font-medium opacity-80">ORDER ID</div>
                      <div className="font-mono text-sm">#{order.id}</div>
                    </div>
                    <div className="flex-1 px-4">
                      <div className="text-xs font-medium opacity-80">STATUS</div>
                      <div className="flex items-center">
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium opacity-80">DATE PLACED</div>
                      <div className="flex items-center text-sm">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {formatDate(order.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <div className="text-sm text-gray-500 mb-2">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'} purchased
                      </div>
                      
                      <div className="space-y-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg shadow-sm border border-gray-100">
                              {item.image ? (
                                <img
                                  src={item.image}
                                  alt={item.title}
                                  className="h-full w-full object-cover object-center transition-opacity hover:opacity-75"
                                />
                              ) : (
                                <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                                  <span className="text-xs text-gray-400">No image</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base font-medium text-gray-900 line-clamp-1">
                                {item.title}
                              </h3>
                              <div className="mt-1 flex items-center text-sm text-gray-500">
                                <span className="mr-4">₹{item.price.toLocaleString()}</span>
                                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                                  Qty: {item.quantity}
                                </span>
                              </div>
                            </div>
                            <div className="text-right text-gray-900 font-medium">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4 mt-6">
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-500">Subtotal</div>
                        <div className="text-sm font-medium text-gray-900">
                          ₹{total.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <div className="text-sm text-gray-500">Shipping</div>
                        <div className="text-sm font-medium text-gray-900">₹0</div>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                        <div className="text-base font-medium text-gray-900">Order Total</div>
                        <div className="text-base font-bold text-indigo-600">
                          ₹{total.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <div className="mt-5"><Footer /></div>
    </main>
  )
}

export default ProfilePage