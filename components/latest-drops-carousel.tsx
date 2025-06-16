// components/LatestDropsCarousel.tsx (Updated)

"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useMobile } from "@/hooks/use-mobile"

import { supabase } from "../lib/supabase" // Assuming correct path
import { useCartStore } from "@/store/cartStore"
import { AddToCartModal } from "./ui/add-to-cart-modal"

// --- 1. Import the new cart drawer store ---
import { useCartDrawerStore } from "@/store/cartDrawerStore"

// Define the Poster type
type Poster = {
  id: string
  title: string
  image: string | null
  price: number
}

export default function LatestDropsCarousel() {
  // ... (all your existing state remains the same)
  const [data, setData] = useState<Poster[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()
  
  // Get actions from both stores
  const addToCart = useCartStore((state) => state.addToCart)
  // --- 2. Get the openDrawer action from our new store ---
  const { openDrawer } = useCartDrawerStore()

  // ... (the rest of your code remains largely the same)
  const itemsPerView = isMobile ? 2 : 4
  const maxIndex = data.length > 0 ? data.length - itemsPerView : 0

  useEffect(() => {
    // ... data fetching logic is perfect ...
    const fetchData = async () => {
      try {
        const { data: fetchedData, error } = await supabase.from("products").select("*").eq("latest",true)
        if (error) { console.error("Error fetching data:", error) } 
        else { setData(fetchedData || []) }
      } catch (err) { console.error("Unexpected error:", err) }
    }
    fetchData()
  }, [])
  
  useEffect(() => {
    // ... modal closing logic is perfect ...
     if (isModalOpen) {
      const timer = setTimeout(() => setIsModalOpen(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [isModalOpen])

  const scrollToIndex = (index: number) => {
    // ... scroll logic is perfect ...
     if (!carouselRef.current) return
    const newIndex = Math.max(0, Math.min(index, maxIndex))
    setCurrentIndex(newIndex)
    const itemWidth = carouselRef.current.scrollWidth / (data.length || 1)
    carouselRef.current.scrollTo({ left: newIndex * itemWidth, behavior: "smooth" })
  }

  const handleNext = () => scrollToIndex(currentIndex + 1)
  const handlePrev = () => scrollToIndex(currentIndex - 1)

  // --- 3. The handler now calls openDrawer ---
  const handleAddToCart = (poster: Poster) => {
    addToCart({
      id: poster.id,
      name: poster.title,
      price: poster.price,
      quantity: 1, // Always add one at a time from the carousel
      image: poster.image || "/placeholder.svg",
    })
    setIsModalOpen(true) // Show the success tick modal
    openDrawer() // <--- This is the magic line that opens the cart drawer
  }

  // ... (touch handlers are perfect) ...
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
      <AddToCartModal isOpen={isModalOpen} />

      <div
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          ref={carouselRef}
          className="flex space-x-4 overflow-x-scroll scrollbar-hide snap-x"
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
                  <Link href={`/product/${poster.id}`} className="font-medium hover:underline text-center">
                    {poster.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">₹{poster.price.toFixed(2)}</p>
                  {/* The button now calls our new handler */}
                  <Button 
                    className="flex flex-grow-1 mt-6 w-full font-bold" 
                    onClick={() => handleAddToCart(poster)}
                  >
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation and dots are perfect */}
      <div className="hidden md:block">
         <Button variant="outline" size="icon" className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full" onClick={handlePrev} disabled={currentIndex === 0}><ChevronLeft className="h-4 w-4" /><span className="sr-only">Previous</span></Button>
        <Button variant="outline" size="icon" className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full" onClick={handleNext} disabled={currentIndex >= maxIndex}><ChevronRight className="h-4 w-4" /><span className="sr-only">Next</span></Button>
      </div>
      <div className="mt-4 flex justify-center space-x-1 md:hidden">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => ( <button key={index} className={`h-1.5 rounded-full ${index === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-muted"}`} onClick={() => scrollToIndex(index)} /> ))}
      </div>
    </div>
  )
}