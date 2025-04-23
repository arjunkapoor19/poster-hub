"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import Header from "@/components/header"

const ProfilePage = () => {
  const [orders, setOrders] = useState<any[]>([])
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

      if (!ordersError) {
        setOrders(ordersData || [])
      }

      setLoading(false)
    }

    fetchOrders()
  }, [])

  return (
    
    <main className="mx-auto px-4">
        <Header />
      <div className="pt-5 px-5">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      {loading ? (
        <div className="text-muted-foreground">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="bg-muted text-center py-20 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-2">No orders yet</h2>
          <p className="text-muted-foreground">Go to store to place an order.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-4 border rounded-xl bg-white shadow-sm"
            >
              <div className="font-medium">Order #{order.id}</div>
              <div className="text-sm text-muted-foreground">
                Placed on: {new Date(order.created_at).toLocaleDateString()}
              </div>
              {/* You can show more details like items, total, etc. */}
            </div>
          ))}
          
        </div>

      )}
      </div>
    </main>
  )
}

export default ProfilePage
