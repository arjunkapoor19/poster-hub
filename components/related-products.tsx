"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useMobile } from "@/hooks/use-mobile"

type Pack = {
  id: string
  title: string
  image_1: string | null
  image_2: string | null
  image_3: string | null
  image_4: string | null
  image_5: string | null
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
  const [carousel3Rotation, setCarousel3Rotation] = useState(0)
  const [carousel5Rotation, setCarousel5Rotation] = useState(0)
  const isMobile = useMobile()

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setLoading(true)
      
      let query = supabase
        .from(tableName)
        .select("id, title, image_1, image_2, image_3, image_4, image_5, price, collection_type")
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

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCarousel3Rotation((prev) => (prev + 1) % 3)
      setCarousel5Rotation((prev) => (prev + 1) % 5)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const getAvailableImages = (pack: Pack): string[] => {
    const images = [
      pack.image_1,
      pack.image_2,
      pack.image_3,
      ...(pack.collection_type === 5 ? [pack.image_4, pack.image_5] : [])
    ].filter((img): img is string => !!img && img.trim() !== "")

    const total = pack.collection_type === 5 ? 5 : 3

    if (images.length === 0) return Array(total).fill("/placeholder.svg")
    const result: string[] = []
    for (let i = 0; i < total; i++) result.push(images[i % images.length])
    return result
  }

  const getCarouselRotation = (type: number) => (type === 5 ? carousel5Rotation : carousel3Rotation)

  const getTransformStyle = (offset: number, isMobile: boolean, type: number) => {
    const is5 = type === 5
    const baseOffset = is5 ? (isMobile ? 15 : 25) : (isMobile ? 25 : 35)
    const scale = Math.max(0.7, 1 - Math.abs(offset) * (is5 ? 0.06 : 0.1))
    const rotateY = offset * (is5 ? 10 : 15)
    const opacity = Math.max(0.4, 1 - Math.abs(offset) * (is5 ? 0.12 : 0.2))
    return {
      transform: `translateX(${offset * baseOffset}px) scale(${scale}) rotateY(${rotateY}deg)`,
      zIndex: Math.max(1, 10 - Math.abs(offset)),
      opacity,
    }
  }

  if (loading) {
    return (
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-6">You may also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-64 rounded-lg"></div>
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
        {packs.map((pack) => {
          const availableImages = getAvailableImages(pack)
          const rotation = getCarouselRotation(pack.collection_type)
          const is5 = pack.collection_type === 5

          return (
            <Link key={pack.id} href={`/collection/${pack.id}`} className="group block">
              <div className="relative w-full h-64 flex items-center justify-center mb-3">
                {/* Collection type badge */}
                <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded-full z-20">
                  {is5 ? "5-Pack" : "3-Pack"}
                </div>
                
                <div
                  className="relative perspective-[1000px]"
                  style={{
                    width: isMobile ? "120px" : "140px",
                    height: isMobile ? "170px" : "200px",
                  }}
                >
                  {availableImages.map((img, i) => {
                    const total = availableImages.length
                    const center = Math.floor(rotation) % total
                    let offset = i - center
                    if (offset > total / 2) offset -= total
                    else if (offset < -total / 2) offset += total

                    return (
                      <div
                        key={`${pack.id}-${i}`}
                        className="absolute inset-0 transition-all duration-700 ease-in-out"
                        style={getTransformStyle(offset, isMobile, pack.collection_type)}
                      >
                        <div className="relative w-full h-full">
                          {img && img !== "/placeholder.svg" ? (
                            <Image
                              src={img}
                              alt={`${pack.title} - Image ${i + 1}`}
                              fill
                              className="object-cover rounded-lg shadow-lg transition-transform group-hover:scale-105"
                              sizes={isMobile ? "120px" : "140px"}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg shadow-lg">
                              <span className="text-gray-400 text-xs">No Image</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm font-medium line-clamp-2 mb-1">{pack.title}</p>
                <p className="font-semibold text-lg">₹{pack.price.toFixed(2)}</p>
                <p className="text-xs text-gray-500">{pack.collection_type} pieces included</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}