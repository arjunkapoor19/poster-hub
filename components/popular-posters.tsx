"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { supabase } from "../lib/supabase"

type Collection = {
  id: string
  name: string
  image: string | null
  description?: string
  itemCount?: number,
  category?: string,
}

export default function Collections() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true)
        
        // Fetch collections with product count
        const { data: collectionsData, error: collectionsError } = await supabase
          .from("collections")
          .select(`
            id,
            name,
            description,
            image,
            is_active,
            category
          `)
          .eq("is_active", true)
          .order("display_order", { ascending: true })

        if (collectionsError) {
          console.error("Error fetching collections:", collectionsError)
          return
        }

        // If you have a junction table for collection-product relationships
        const collectionsWithCount = await Promise.all(
          (collectionsData || []).map(async (collection) => {
            // Get product count for each collection
            const { count, error: countError } = await supabase
              .from("collection_products")
              .select("*", { count: 'exact', head: true })
              .eq("collection_id", collection.id)

            if (countError) {
              console.error("Error fetching product count:", countError)
            }

            return {
              ...collection,
              itemCount: count || 0
            }
          })
        )

        setCollections(collectionsWithCount)
      } catch (err) {
        console.error("Unexpected error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchCollections()
  }, [])

  return (
    <div className="px-6 py-12">

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-lg animate-pulse">
              <div className="aspect-[3/4] bg-gray-300"></div>
              <div className="p-6">
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-6 w-3/4"></div>
                <div className="h-12 bg-gray-300 rounded-2xl"></div>
              </div>
            </div>
          ))}
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No collections available</p>
        </div>
      ) : (
        /* Collections Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {collections.map((collection) => (
            <div 
              key={collection.id}
              className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
              onMouseEnter={() => setHoveredId(collection.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Image Container with Overlay */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={collection.image || "/placeholder.svg"}
                  alt={collection.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105 ease-in-out"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
                
                {/* Gradient Overlay */}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                  {collection.name}
                </h3>
                
                {/* CTA Button */}
                <Link href={`/collections/${collection.category}`}>
                  <button className="w-full bg-gray-900 text-white py-4 rounded-2xl font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-300">
                    View Collection
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom CTA */}
      <div className="text-center mt-16">
        <Link href="/collections/">
          <button className="inline-flex items-center gap-3 bg-black text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
            <span>Explore All Collections</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </Link>
      </div>
    </div>
  )
}