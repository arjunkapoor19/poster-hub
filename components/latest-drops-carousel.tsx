// components/LatestDropsCarousel.tsx (Enhanced with image size fix, spacing, and smooth fade effect)

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
import { AddToCartModal } from "./ui/add-to-cart-modal"
import { useCartDrawerStore } from "@/store/cartDrawerStore"

// Poster type

type Poster = {
  id: string
  title: string
  image: string | null
  image_2?: string | null
  image_3?: string | null
  price: number
}

export default function LatestDropsCarousel() {
  const [data, setData] = useState<Poster[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()
  const addToCart = useCartStore((state) => state.addToCart)
  const { openDrawer } = useCartDrawerStore()

  const itemsPerView = isMobile ? 1 : 2
  const maxIndex = data.length > 0 ? data.length - itemsPerView : 0

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: fetchedData, error } = await supabase
          .from("products")
          .select("*")
          .eq("latest", true)

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

  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => setIsModalOpen(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [isModalOpen])

  const [carouselRotation, setCarouselRotation] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselRotation((prev) => (prev + 1) % 3)
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return
    const newIndex = Math.max(0, Math.min(index, maxIndex))
    setCurrentIndex(newIndex)
    const itemWidth = carouselRef.current.scrollWidth / (data.length || 1)
    carouselRef.current.scrollTo({ left: newIndex * itemWidth, behavior: "smooth" })
  }

  const handleNext = () => scrollToIndex(currentIndex + 1)
  const handlePrev = () => scrollToIndex(currentIndex - 1)

  const handleAddToCart = (poster: Poster) => {
    addToCart({
      id: poster.id,
      name: poster.title,
      price: poster.price,
      quantity: 1,
      image: poster.image || "/placeholder.svg",
    })
    setIsModalOpen(true)
    openDrawer()
  }

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

  const getAvailableImages = (poster: Poster): string[] => {
    const images = [poster.image, poster.image_2, poster.image_3].filter(Boolean) as string[]
    if (images.length === 0) return ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"]
    if (images.length === 1) return [images[0], images[0], images[0]]
    if (images.length === 2) return [images[0], images[1], images[0]]
    return images.slice(0, 3)
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
          className="flex space-x-4 overflow-x-scroll scrollbar-hide snap-x px-2"
        >
          {data.map((poster) => {
            const availableImages = getAvailableImages(poster)

            return (
              <div
                key={poster.id}
                className="flex-none w-full sm:w-[calc(50%-8px)] snap-start"
              >
                <Card className="overflow-hidden border-0 shadow-none">
                  <CardContent className="p-0">
                    <div className="relative w-full h-[400px] flex items-center justify-center">
                      <div className="relative w-[220px] h-[340px] perspective-[1000px]">
                        {availableImages.map((img, i) => {
                          const center = carouselRotation
                          const offset = i - center
                          return (
                            <div
                              key={i}
                              className="absolute w-[220px] h-[340px] transition-all duration-700 ease-in-out"
                              style={{
                                transform: `translateX(${offset * 70}px) scale(${1 - Math.abs(offset) * 0.15}) rotateY(${offset * 20}deg)`,
                                zIndex: 10 - Math.abs(offset),
                                opacity: 1 - Math.abs(offset) * 0.3,
                              }}
                            >
                              <Link href={`/product/${poster.id}`} className="block relative w-full h-full">
                                <Image
                                  src={img}
                                  alt={`${poster.title} - Image ${i + 1}`}
                                  fill
                                  className="object-cover rounded-xl shadow-md"
                                />
                              </Link>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col p-3 pt-4 items-center space-y-2">
                    <Link href={`/product/${poster.id}`} className="font-medium hover:underline text-center">
                      {poster.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">₹{poster.price.toFixed(2)}</p>
                    <Button
                      className="flex flex-grow-1 mt-3 w-full font-bold"
                      onClick={() => handleAddToCart(poster)}
                    >
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            )
          })}
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