"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation" 
import { supabase } from "@/lib/supabaseClient"
import Header from "@/components/header"
import { CalendarIcon, ShoppingBag, Package, Truck, CheckCircle, Clock, LogOut, DollarSign, CircleAlert } from "lucide-react"
import Footer from "@/components/footer"

// --- TYPES ---
// This now represents the minimal data we expect in the items array
type OrderItemRaw = {
  product_id: string
  quantity: number
  // Add optional properties for the cases where data is embedded
  name?: string
  price?: number
  image?: string
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
  // Add total_amount to the Order type
  total_amount: number
}

const ProfilePage = () => {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) { throw new Error("Could not log out: " + error.message) }
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Failed to log out. Please try again.")
    } finally {
      setIsLoggingOut(false)
    }
  }

  useEffect(() => {
    const fetchOrders = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push("/login")
        return
      }
      
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("id, created_at, status, items, total_amount")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (ordersError || !ordersData) {
        setLoading(false)
        return
      }

      const allProductIds = new Set<string>()
      const parsedOrders = ordersData.map((order) => {
        const items: OrderItemRaw[] = typeof order.items === "string" ? JSON.parse(order.items) : order.items
        items.forEach((item) => {
          if (item.product_id && !item.name) {
            allProductIds.add(item.product_id)
          }
        })
        return { ...order, items }
      })

      let productMap = new Map<string, Product>()
      if (allProductIds.size > 0) {
        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("id, title, price, image")
          .in("id", Array.from(allProductIds))

        if (productsError || !productsData) {
          console.error("Error fetching product details:", productsError)
        } else {
          productsData.forEach((p) => productMap.set(p.id, p))
        }
      }

      const finalOrders: Order[] = parsedOrders.map((order) => {
        const populatedItems = order.items.map((item: OrderItemRaw) => {
          if (item.name && item.price) {
            return {
              id: item.product_id || '',
              title: item.name,
              price: item.price,
              image: item.image || '',
              quantity: item.quantity,
            }
          }
          
          const product = productMap.get(item.product_id)
          if (product) {
            return { ...product, quantity: item.quantity }
          }
          
          return null
        }).filter(Boolean) as PopulatedOrderItem[]

        return {
          id: order.id,
          created_at: order.created_at,
          status: order.status || "Processing",
          items: populatedItems,
          total_amount: order.total_amount || 0
        }
      })

      setOrders(finalOrders)
      setLoading(false)
    }

    fetchOrders()
  }, [router])

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  const StatusBadge = ({ status }: { status: string }) => {
    let icon, bgColor, textColor, borderColor
    switch(status.toLowerCase()) {
      case 'delivered': icon = <CheckCircle className="w-3 h-3 mr-1" />; bgColor = "bg-green-50"; textColor = "text-green-800"; borderColor = "border-green-200"; break
      case 'shipped': icon = <Package className="w-3 h-3 mr-1" />; bgColor = "bg-blue-50"; textColor = "text-blue-800"; borderColor = "border-blue-200"; break
      case 'out for delivery': icon = <Truck className="w-3 h-3 mr-1" />; bgColor = "bg-yellow-50"; textColor = "text-yellow-800"; borderColor = "border-yellow-200"; break
      case 'pending payment': icon = <CircleAlert className="w-3 h-3 mr-1" />; bgColor = "bg-yellow-50"; textColor = "text-yellow-800"; borderColor = "border-yellow-200"; break
      case 'payment failed': icon = <Clock className="w-3 h-3 mr-1" />; bgColor = "bg-red-50"; textColor = "text-red-800"; borderColor = "border-red-200"; break
      case 'payment confirmed': icon = <DollarSign className="w-3 h-3 mr-1" />; bgColor = "bg-green-50"; textColor = "text-green-800"; borderColor = "border-green-200"; break
      case 'processing':
      default: icon = <Clock className="w-3 h-3 mr-1" />; bgColor = "bg-gray-100"; textColor = "text-gray-800"; borderColor = "border-gray-200"; break
    }
    // Added border-none and border-opacity-50 to status badge to match the minimalistic theme
    return <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor} border ${borderColor}`}>{icon}{status}</div>
  }

  return (
    <main className="bg-white min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto pt-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200"> {/* Added bottom border */}
          <div className="flex items-center">
            <ShoppingBag className="h-8 w-8 text-gray-800 mr-3" /> {/* Changed icon color */}
            <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
          </div>
          <button onClick={handleLogout} disabled={isLoggingOut} className="flex items-center justify-center px-4 py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"> {/* Changed button styles */}
            <LogOut className="h-4 w-4 mr-2" />
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-xl shadow-sm border border-gray-200"> {/* Changed background and added border */}
            <div className="text-gray-600 text-lg">Loading your orders...</div> {/* Changed text color */}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 overflow-hidden"> {/* Changed background and added border */}
            <div className="text-center py-16 px-4">
              <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">No orders yet</h2>
              <p className="text-gray-500 max-w-md mx-auto">Your order history will appear here once you've made a purchase.</p>
              <button onClick={() => router.push('/')} className="mt-6 px-6 py-2 bg-gray-800 text-white rounded-md font-medium hover:bg-gray-700 transition-colors"> {/* Changed button styles */}
                Browse Store
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)
              const total = order.total_amount

              return (
                <div key={order.id} className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 overflow-hidden"> {/* Changed background and added border */}
                   <div className="bg-gray-100 text-gray-800 px-6 py-3 flex items-center border-b border-gray-200"> {/* Changed background, text color, and added bottom border */}
                    <div className="flex-1">
                      <div className="text-xs font-medium opacity-80">ORDER ID</div>
                      <div className="font-mono text-sm">#{order.id.slice(0, 8)}...</div>
                    </div>
                    <div className="flex-1 px-4">
                      <div className="text-xs font-medium opacity-80">STATUS</div>
                      <div className="flex items-center"><StatusBadge status={order.status} /></div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-medium opacity-80">DATE PLACED</div>
                      <div className="flex items-center text-sm"><CalendarIcon className="h-3 w-3 mr-1 text-gray-600" />{formatDate(order.created_at)}</div> {/* Changed icon color */}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 mb-2">{itemCount} {itemCount === 1 ? 'item' : 'items'} purchased</div> {/* Changed text color */}
                      <div className="space-y-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg shadow-sm border border-gray-200"> {/* Added border */}
                              {item.image ? (<img src={item.image} alt={item.title} className="h-full w-full object-cover object-center transition-opacity hover:opacity-75"/>) : (<div className="h-full w-full bg-gray-100 flex items-center justify-center"><span className="text-xs text-gray-400">No image</span></div>)}
                            </div>
                            <div className="flex-1">
                              <h3 className="text-base font-medium text-gray-900 line-clamp-1">{item.title}</h3>
                              <div className="mt-1 flex items-center text-sm text-gray-600"> {/* Changed text color */}
                                <span className="mr-4">₹{item.price.toLocaleString()}</span>
                                <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">Qty: {item.quantity}</span>
                              </div>
                            </div>
                            <div className="text-right text-gray-900 font-medium">₹{(item.price * item.quantity).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="border-t border-gray-200 pt-4 mt-6">
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                        <div className="text-base font-medium text-gray-900">Order Total</div>
                        <div className="text-base font-bold text-gray-800">₹{total.toLocaleString()}</div> {/* Changed text color */}
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