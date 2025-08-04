"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import Footer from "@/components/footer"
import DropdownProducts from "@/components/dropdown"
import RelatedProducts from "@/components/related-products"
import Header from "@/components/header"
import { useCartStore } from "@/store/cartStore"


// Define the Product type
type Product = {
  id: string
  title: string
  image: string | null
  category: string
  description: string
  price: number
  rating: number
  reviews: number
}

export default function ProductPage() {
  const { id } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const addToCart = useCartStore((state) => state.addToCart)

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        console.error("Error fetching product:", error)
      } else {
        setProduct(data)
      }
      setLoading(false)
    }

    if (id) fetchProduct()
  }, [id])

  if (loading) return <div>Loading...</div>
  if (!product) return <div>Product not found</div>
  console.log("Description is: ", product.description)

  return (
    <div className="container mx-auto px-4">
      
      <Header />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative w-full aspect-[2/3]">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              No Image Available
            </div>
          )}
        </div>

        <div>
          <h1 className="text-4xl font-light">{product.title}</h1>
          <p className="text-gray-500 mt-2">{product.category}</p>
          <p className="mt-2 text-lg flex items-center">
            <span className="text-yellow-500">⭐ {product.rating.toFixed(1)}</span> / 5 &bull; {product.reviews}+ Reviews
          </p>
          

          
          {/* Ratings and Reviews */}
          <p className="mt-4 text-2xl font-light ">
            <span className="text-xl line-through text-gray-600">
                ₹{((product.price)+product.price*0.4).toFixed(2)}
                </span> 
                <span className="mx-3">₹{product.price.toFixed(2)}</span>
                <span className="text-xl bg-black text-white p-2 px-3 border rounded-full">
                    Sale
                </span>
                
          </p>

          <div className="text-sm mt-3">Taxes included. Shipping calculated at u .</div>

          <div className="pt-5">
          Size:
          <span className="text-md bg-black text-white p-1 px-3 border rounded-full ml-2 mt-3">
                    A4
                </span>
            </div>

        {/* Quantity Selector */}
        <div className="flex items-center space-x-4 mt-4">
            <Button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="bg-white text-black border border-black hover:bg-gray-200 rounded-sm">-</Button>
            <span className="text-xl font-bold">{quantity}</span>
            <Button onClick={() => setQuantity(quantity + 1)} className="bg-white text-black border border-black hover:bg-gray-200 rounded-sm">+</Button>
          </div>
          
          {/* Combo Deals Section */}
          <div className="mt-4 text-sm text-gray-700">
            <p>🔥 High-resolution print with rich, true-to-life colors</p>
            <p>💧 Printed on durable, gallery-grade waterproof paper </p>
            <p>🎁 Perfect for gifting or personal decor</p>
          </div>
          
          <Button className="mt-6 w-full font-bold" onClick={() => addToCart({ id: product.id, name: product.title, price: product.price, quantity: quantity, image: product.image || "/placeholder.svg" })}>Add to Cart</Button>

        </div>
      </div>

          <div className="mt-5"><DropdownProducts description={product.description} /></div>

          <div className="mb-8"><RelatedProducts category={product.category} /></div>

      <Footer />
    </div>
  )
}
