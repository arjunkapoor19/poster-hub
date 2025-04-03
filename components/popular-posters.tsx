"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "./ui/button"

import { useEffect, useState } from "react"
import { supabase } from "../lib/supabase"
import { useCartStore } from "@/store/cartStore"

type Poster = {
    id: string
    title: string
    image: string | null
    price: number
  }

export default function PopularPosters() {
    const [data, setData] = useState<Poster[]>([])
    const addToCart = useCartStore((state) => state.addToCart)

    useEffect(() => {
        const fetchData = async () => {
          try {
            const { data: fetchedData, error } = await supabase.from("products").select("*").eq("popular", true)
            console.log("Fetched data is: ", fetchedData)
            if (error) {
              console.error("Error fetching data:", error)
            } else {
              setData(fetchedData || [])
            }
          } catch (err) {
            console.error("Unexpected error:", err)
          }
        }
    
        fetchData()
      }, [])
      
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {data.map((poster) => (
        <Card key={poster.id} className="overflow-hidden border-0 shadow-sm">
          <CardContent className="p-0">
            <Link href={`/product/${poster.id}`} className="relative block aspect-[2/3] overflow-hidden">
              <Image
                src={poster.image || "/placeholder.svg"}
                alt={poster.title}
                fill
                className="object-cover transition-transform duration-300 hover:scale-105"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
            </Link>
          </CardContent>
          <CardFooter className="flex flex-col items-start p-4">
            <Link href={`/product/${poster.id}`} className="font-medium hover:underline">
              {poster.title}
            </Link>
            <p className="text-sm text-muted-foreground">₹{poster.price.toFixed(2)}</p>
            <Button className="flex flex-grow-1 mt-6 w-full font-bold" onClick={() => addToCart({ id: poster.id, name: poster.title, price: poster.price, quantity: 1 })}>Add to Cart</Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

