"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { AnimatedSearch } from "@/components/animated-search"
import { ShoppingCart, UserRound } from "lucide-react"
import Link from "next/link"
import MobileMenu from "@/components/mobile-menu"
import Footer from "@/components/footer"
import DropdownProducts from "@/components/dropdown"
import RelatedProducts from "@/components/related-prodUCts"


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
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-5 pb-3">
        <div className="container flex h-14 items-center pl-0">
          <MobileMenu />
          <Link href="/" className="md:mr-4 absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none md:left-0 flex items-center space-x-2">
            <span className="text-2xl md:text-3xl font-bold md:ml-7">Postered</span>
          </Link>
          <div className="hidden flex-1 md:flex">
            <nav className="flex items-center space-x-6 text-m font-medium ml-10">
              <Link href="/shop" className="transition-colors hover:text-foreground/80">
                Shop
              </Link>
              <Link href="/collections" className="transition-colors hover:text-foreground/80">
                Collections
              </Link>
              <Link href="/new" className="transition-colors hover:text-foreground/80">
                New Arrivals
              </Link>
              <Link href="/sale" className="transition-colors hover:text-foreground/80">
                Sale
              </Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <AnimatedSearch />
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Cart</span>
            </Button>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <UserRound className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
          </div>
        </div>
      </header>
      
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

          <div className="text-sm mt-3">Taxes included. Shipping calculated at checkout.</div>

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
          
          <Button className="mt-6 w-full font-bold">Add to Cart</Button>
          <Button className="mt-2 w-full font-bold">Buy Now</Button>

        </div>
      </div>

          <div className="mt-5"><DropdownProducts description={product.description} /></div>

          <div className="mb-8"><RelatedProducts category={product.category} /></div>

      <Footer />
    </div>
  )
}
