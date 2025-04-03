"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type Product = {
  id: string
  title: string
  image: string | null
  price: number
}

export default function RelatedProducts({ category }: { category: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("products")
        .select("id, title, image, price")
        .eq("category", category) // Get products from the same category
        .limit(4) // Fetch only 4 related products

      if (error) {
        console.error("Error fetching related products:", error)
      } else {
        setProducts(data)
      }
      setLoading(false)
    }

    if (category) fetchRelatedProducts()
  }, [category])

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold mb-6">You may also like</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group block">
              <div className="relative w-full">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={500} // Set a reasonable max width
                    height={700} // Auto height adjustment
                    className="w-full h-auto rounded-lg transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-48 bg-gray-200">
                    No Image
                  </div>
                )}
              </div>
              <p className="mt-3 text-sm text-center">{product.title}</p>
              <p className="text-center font-medium">₹{product.price.toFixed(2)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
