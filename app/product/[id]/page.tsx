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
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <p className="text-gray-500 mt-2">{product.category}</p>
          <p className="mt-2 text-lg flex items-center">
            <span className="text-yellow-500">⭐ {product.rating.toFixed(1)}</span> / 5 &bull; {product.reviews}+ Reviews
          </p>
          <p className="mt-4 text-lg">{product.description}</p>


          {/* Quantity Selector */}
          <div className="flex items-center space-x-4 mt-4">
            <Button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</Button>
            <span className="text-xl font-bold">{quantity}</span>
            <Button onClick={() => setQuantity(quantity + 1)}>+</Button>
          </div>
          {/* Ratings and Reviews */}
          
          
          <p className="mt-4 text-2xl font-semibold">₹{product.price.toFixed(2)}</p>
          
          {/* Combo Deals Section */}
          <div className="mt-4 text-sm text-gray-700">
            <p>🔥 Buy 1 Set Get 1 Free (Add 2 to Cart)</p>
            <p>🔥 Buy 2 Sets Get 3 Free (Add 5 Sets to Cart) <span className="text-red-500">Best Value - Limited Time Offer!</span></p>
            <p>🔥 Buy 3 Sets Get 5 Free (Add 8 Sets to Cart)</p>
          </div>
          
          <Button className="mt-6 w-full font-bold">Add to Cart</Button>
          <Button className="mt-2 w-full font-bold">Buy Now</Button>
        </div>
      </div>
    </div>
  )
}
