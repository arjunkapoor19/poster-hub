"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

type Pack = {
  id: string
  title: string
  image_1: string | null
  price: number
  collection_type: number
}

interface RelatedProductsProps {
  category: string
  tableName?: string
  currentPackId?: string
}

export default function RelatedProducts({ 
  category, 
  tableName = "packs", 
  currentPackId 
}: RelatedProductsProps) {
  const [packs, setPacks] = useState<Pack[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setLoading(true)
      
      let query = supabase
        .from(tableName)
        .select("id, title, image_1, price, collection_type")
        .eq("category", category)
        .limit(4)

      // Exclude current pack if provided
      if (currentPackId) {
        query = query.neq("id", currentPackId)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching related products:", error)
      } else {
        setPacks(data || [])
      }
      setLoading(false)
    }

    if (category) fetchRelatedProducts()
  }, [category, tableName, currentPackId])

  if (loading) {
    return (
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-6">You may also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 aspect-[1/1.414] rounded-lg"></div>
              <div className="h-4 bg-gray-200 rounded mt-3"></div>
              <div className="h-4 bg-gray-200 rounded mt-2 w-16 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (packs.length === 0) {
    return (
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-6">You may also like</h2>
        <p className="text-gray-500 text-center py-8">No related products found in this category.</p>
      </div>
    )
  }

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold mb-6">You may also like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {packs.map((pack) => (
          <Link key={pack.id} href={`/product/${pack.id}`} className="group block">
            <div className="relative w-full aspect-[1/1.414]">
              {pack.image_1 ? (
                <Image
                  src={pack.image_1}
                  alt={pack.title}
                  fill
                  className="object-cover rounded-lg transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-gray-200 rounded-lg">
                  <span className="text-gray-400 text-sm">No Image</span>
                </div>
              )}
              {/* Collection type badge */}
              <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded-full">
                {pack.collection_type}-Pack
              </div>
            </div>
            <p className="mt-3 text-sm text-center font-medium line-clamp-2">{pack.title}</p>
            <p className="text-center font-semibold text-lg">₹{pack.price.toFixed(2)}</p>
            <p className="text-center text-xs text-gray-500">{pack.collection_type} pieces included</p>
          </Link>
        ))}
      </div>
    </div>
  )
}