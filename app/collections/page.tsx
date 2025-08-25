// src/app/collections/page.tsx
"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Paintbrush } from "lucide-react"

import Footer from "@/components/footer"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from '../../lib/supabase'

// Define the type for a single collection for TypeScript safety
type Collection = {
  id: number
  name: string
  image: string
  category: string
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCollections = async () => {
      const { data, error } = await supabase.from("collections").select("id, name, image, category")

      if (error) {
        console.error("Error fetching collections:", error.message)
      } else {
        setCollections(data || [])
      }
      setLoading(false)
    }

    fetchCollections()
  }, [])

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <Heart className="h-12 w-12 text-pink-400" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Our Collections</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Explore our specially curated collections, each filled with crazy art to bring joy to your space!
          </p>
        </div>

        {/* Loading state */}
        {loading ? (
          <p className="text-center text-muted-foreground">Loading collections...</p>
        ) : collections.length === 0 ? (
          <p className="text-center text-muted-foreground">No collections found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Card
                key={collection.id}
                className="group flex flex-col overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
              >
                <CardHeader className="p-0">
                  <Link href={`/collections/${collection.id}`} className="block overflow-hidden">
                    <Image
                      src={collection.image}
                      alt={collection.name}
                      width={794}  
                      height={1123} 
                      className="w-full h-auto object-contain aspect-[210/297] transition-transform duration-300 group-hover:scale-105"
                    />
                  </Link>
                </CardHeader>
                <CardContent className="flex-1 p-6">
                  <CardTitle className="text-2xl mb-2">{collection.name}</CardTitle>
                  <p className="text-muted-foreground">{collection.category}</p>
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-4 p-6 pt-0">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Paintbrush className="h-4 w-4 mr-2" />
                    <span>{collection.category}</span>
                  </div>
                  <Link href={`/collections/${collection.category}`} className="w-full">
                    <Button className="w-full font-bold transition-colors bg-black hover:bg-gray-800 text-white">
                      View Collection
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
