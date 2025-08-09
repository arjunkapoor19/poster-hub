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
import { PremiumLoader } from "./ui/loader"

type Collection = {
  id: string | number
  title: string
  price: number
  latest: boolean
  image_1?: string | null
  image_2?: string | null
  image_3?: string | null
  image_4?: string | null
  image_5?: string | null
  collection_type: number // Fixed here
}

export default function LatestDropsCarousel() {
  const [data, setData] = useState<Collection[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()
  const addToCart = useCartStore((state) => state.addToCart)
  const { openDrawer } = useCartDrawerStore()

  const itemsPerView = isMobile ? 2 : 4
  const maxIndex = data.length > 0 ? Math.max(0, data.length - itemsPerView) : 0

  useEffect(() => {
    const fetchData = async () => {
      const { data: fetchedData, error } = await supabase
        .from("packs")
        .select("*")
        .eq("latest", true)

      if (error) {
        console.error("Error fetching data:", error)
      } else {
        console.log("Fetched collections:", fetchedData)
        setData(fetchedData ?? [])
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

  const [carousel3Rotation, setCarousel3Rotation] = useState(0)
  const [carousel5Rotation, setCarousel5Rotation] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCarousel3Rotation((prev) => (prev + 1) % 3)
      setCarousel5Rotation((prev) => (prev + 1) % 5)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const scrollToIndex = (index: number) => {
    if (!carouselRef.current || data.length === 0) return
    const newIndex = Math.max(0, Math.min(index, maxIndex))
    setCurrentIndex(newIndex)
    const itemWidth = carouselRef.current.scrollWidth / data.length
    carouselRef.current.scrollTo({ left: newIndex * itemWidth, behavior: "smooth" })
  }

  const handleNext = () => scrollToIndex(currentIndex + 1)
  const handlePrev = () => scrollToIndex(currentIndex - 1)

  const handleAddToCart = (collection: Collection) => {
    const firstImage = getAvailableImages(collection)[0]
    addToCart({
      id: String(collection.id),
      name: collection.title,
      price: collection.price,
      quantity: 1,
      image: firstImage,
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

  const getAvailableImages = (collection: Collection): string[] => {
    const images = [
      collection.image_1,
      collection.image_2,
      collection.image_3,
      ...(collection.collection_type === 5 ? [collection.image_4, collection.image_5] : [])
    ].filter((img): img is string => !!img && img.trim() !== "")

    const total = collection.collection_type === 5 ? 5 : 3

    if (images.length === 0) return Array(total).fill("/placeholder.svg")
    const result: string[] = []
    for (let i = 0; i < total; i++) result.push(images[i % images.length])
    return result
  }

  const getCarouselRotation = (type: number) => (type === 5 ? carousel5Rotation : carousel3Rotation)

  const getTransformStyle = (offset: number, isMobile: boolean, type: number) => {
    const is5 = type === 5
    const baseOffset = is5 ? (isMobile ? 20 : 30) : (isMobile ? 35 : 50)
    const scale = Math.max(0.6, 1 - Math.abs(offset) * (is5 ? 0.08 : 0.12))
    const rotateY = offset * (is5 ? 12 : 18)
    const opacity = Math.max(0.3, 1 - Math.abs(offset) * (is5 ? 0.15 : 0.25))
    return {
      transform: `translateX(${offset * baseOffset}px) scale(${scale}) rotateY(${rotateY}deg)`,
      zIndex: Math.max(1, 10 - Math.abs(offset)),
      opacity,
    }
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="text-sm text-muted-foreground">
            op
        </div>
      </div>
    )
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
          className="flex space-x-3 overflow-x-scroll scrollbar-hide snap-x px-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {data.map((collection) => {
            const availableImages = getAvailableImages(collection)
            const rotation = getCarouselRotation(collection.collection_type)
            const is5 = collection.collection_type === 5

            return (
              <div
                key={collection.id}
                className="flex-none w-[calc(50%-6px)] sm:w-[calc(25%-9px)] snap-start"
              >
                <Card className="overflow-hidden border-0 shadow-none bg-transparent">
                  <CardContent className="p-0">
                    <div className="relative w-full h-[280px] sm:h-[320px] flex items-center justify-center">
                      <div
                        className="relative perspective-[1000px]"
                        style={{
                          width: isMobile ? "140px" : "180px",
                          height: isMobile ? "220px" : "280px",
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
                              key={`${collection.id}-${i}`}
                              className="absolute inset-0 transition-all duration-700 ease-in-out"
                              style={getTransformStyle(offset, isMobile, collection.collection_type)}
                            >
                              <Link href={`/collection/${collection.id}`} className="block relative w-full h-full">
                                <Image
                                  src={img}
                                  alt={`${collection.title} - Image ${i + 1}`}
                                  fill
                                  className="object-cover rounded-xl shadow-lg"
                                  sizes={isMobile ? "140px" : "180px"}
                                />
                              </Link>
                            </div>
                          )
                        })}
                      </div>

                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full z-20">
                        {is5 ? "5-Pack" : "3-Pack"}
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col p-2 pt-3 items-center space-y-1.5">
                    <Link
                      href={`/collection/${collection.id}`}
                      className="font-bold hover:underline text-center text-base line-clamp-2"
                    >
                      {collection.title}
                    </Link>
                    <p className="text-lg font-semibold text-foreground">₹{collection.price.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {is5 ? "5 Items" : "3 Items"} Collection
                    </p>
                    <Button
                      className="w-full font-bold text-xs h-8 mt-2"
                      onClick={() => handleAddToCart(collection)}
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
          className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full z-10"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full z-10"
          onClick={handleNext}
          disabled={currentIndex >= maxIndex}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {maxIndex > 0 && (
        <div className="mt-4 flex justify-center space-x-1 md:hidden">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-muted"
              }`}
              onClick={() => scrollToIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
