"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useMobile } from "@/hooks/use-mobile"

import { supabase } from "../lib/supabase"
import { useCartStore } from "@/store/cartStore"

// Define the Poster type
type Poster = {
  id: string
  title: string
  image: string | null
  price: number
}

export default function LatestDropsCarousel() {
  const [data, setData] = useState<Poster[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()
  const addToCart = useCartStore((state) => state.addToCart)

  const itemsPerView = isMobile ? 2 : 4
  const maxIndex = data.length - itemsPerView

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: fetchedData, error } = await supabase.from("products").select("*").eq("latest",true)
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

  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return

    const newIndex = Math.max(0, Math.min(index, maxIndex))
    setCurrentIndex(newIndex)

    const itemWidth = carouselRef.current.scrollWidth / (data.length || 1)
    carouselRef.current.scrollTo({
      left: newIndex * itemWidth,
      behavior: "smooth",
    })
  }

  const handleNext = () => scrollToIndex(currentIndex + 1)
  const handlePrev = () => scrollToIndex(currentIndex - 1)

  // Handle touch events for mobile swiping
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX)
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX)

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    if (distance > 50) handleNext()
    if (distance < -50) handlePrev()

    setTouchStart(null)
    setTouchEnd(null)
  }

  return (
    <div className="relative">
      <div
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={carouselRef}
          className="flex space-x-4 overflow-x-scroll scrollbar-hide snap-x"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {data.map((poster) => (
            <div
              key={poster.id}
              className="flex-none w-[calc(50%-8px)] sm:w-[calc(33.333%-16px)] md:w-[calc(25%-16px)] snap-start"
            >
              <Card className="overflow-hidden border-0 shadow-sm">
                <CardContent className="p-0">
                  <Link href={`/product/${poster.id}`} className="relative block aspect-[2/3] overflow-hidden">
                    <Image
                      src={poster.image || "/placeholder.svg"}
                      alt={poster.title}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    />
                  </Link>
                </CardContent>
                <CardFooter className="flex flex-col p-4 items-center">
                  <Link href={`/product/${poster.id}`} className="font-medium hover:underline">
                    {poster.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">₹{poster.price.toFixed(2)}</p>
                  <Button className="flex flex-grow-1 mt-6 w-full font-bold" onClick={() => addToCart({ id: poster.id, name: poster.title, price: poster.price, quantity: 1 })}>
                    Add to Cart
                    </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <div className="hidden md:block">
        <Button
          variant="outline"
          size="icon"
          className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
          onClick={handleNext}
          disabled={currentIndex >= maxIndex}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next</span>
        </Button>
      </div>

      <div className="mt-4 flex justify-center space-x-1 md:hidden">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            className={`h-1.5 rounded-full ${index === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-muted"}`}
            onClick={() => scrollToIndex(index)}
          />
        ))}
      </div>
    </div>
  )
}
