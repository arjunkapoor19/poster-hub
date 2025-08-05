// components/LatestDropsCarousel.tsx

"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { AddToCartModal } from "./ui/add-to-cart-modal"
import { useMobile } from "@/hooks/use-mobile"
import { supabase } from "../lib/supabase"
import { useCartStore } from "@/store/cartStore"
import { useCartDrawerStore } from "@/store/cartDrawerStore"

// Type for collections from Supabase
type Collection = {
  id: string
  title: string
  price: number
  latest: boolean
  collection_type: "3" | "5"
  image_1?: string | null
  image_2?: string | null
  image_3?: string | null
  image_4?: string | null
  image_5?: string | null
}

export default function LatestDropsCarousel2() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [carousel3Index, setCarousel3Index] = useState(0)
  const [carousel5Index, setCarousel5Index] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const carouselRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()
  const addToCart = useCartStore((state) => state.addToCart)
  const { openDrawer } = useCartDrawerStore()

  const itemsPerView = isMobile ? 2 : 4
  const maxIndex = collections.length > 0 ? collections.length - itemsPerView : 0

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("packs")
        .select("*")
        .eq("latest", true)

      if (error) console.error("Error fetching collections:", error)
      else setCollections(data || [])
    }

    fetchData()
  }, [])

  // Modal close delay
  useEffect(() => {
    if (!isModalOpen) return
    const timer = setTimeout(() => setIsModalOpen(false), 1500)
    return () => clearTimeout(timer)
  }, [isModalOpen])

  // Auto rotate carousel images
  useEffect(() => {
    const interval = setInterval(() => {
      setCarousel3Index((prev) => (prev + 1) % 3)
      setCarousel5Index((prev) => (prev + 1) % 5)
    }, 1500)

    return () => clearInterval(interval)
  }, [])

  // Carousel scroll behavior
  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return
    const newIndex = Math.max(0, Math.min(index, maxIndex))
    setCurrentIndex(newIndex)
    const itemWidth = carouselRef.current.scrollWidth / collections.length
    carouselRef.current.scrollTo({ left: newIndex * itemWidth, behavior: "smooth" })
  }

  const handleAddToCart = (collection: Collection) => {
    const firstImage = getAvailableImages(collection)[0]
    addToCart({
      id: collection.id,
      name: collection.title,
      price: collection.price,
      quantity: 1,
      image: firstImage,
    })
    setIsModalOpen(true)
    openDrawer()
  }

  const getAvailableImages = (collection: Collection): string[] => {
    const count = String(collection.collection_type) === "5" ? 5 : 3
    const fields = [collection.image_1, collection.image_2, collection.image_3, collection.image_4, collection.image_5]
    const filtered = fields.filter(Boolean) as string[]
    const filled = [...filtered]

    while (filled.length < count) {
      filled.push(...filtered.slice(0, count - filled.length))
    }

    return filled.length ? filled.slice(0, count) : Array(count).fill("/placeholder.svg")
  }

  const getTransformStyle = (offset: number, is5: boolean) => {
    const baseOffset = is5 ? (isMobile ? 25 : 35) : (isMobile ? 40 : 55)
    const scale = 1 - Math.abs(offset) * (is5 ? 0.1 : 0.15)

    return {
      transform: `translateX(${offset * baseOffset}px) scale(${scale}) rotateY(${offset * (is5 ? 15 : 20)}deg)`,
      zIndex: 10 - Math.abs(offset),
      opacity: 1 - Math.abs(offset) * (is5 ? 0.2 : 0.3),
    }
  }

  const handleTouch = {
    start: (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX),
    move: (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX),
    end: () => {
      if (!touchStart || !touchEnd) return
      const distance = touchStart - touchEnd
      if (distance > 50) scrollToIndex(currentIndex + 1)
      else if (distance < -50) scrollToIndex(currentIndex - 1)
      setTouchStart(null)
      setTouchEnd(null)
    },
  }

  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)

  return (
    <div className="relative">
      <AddToCartModal isOpen={isModalOpen} />

      <div
        className="overflow-hidden"
        onTouchStart={handleTouch.start}
        onTouchMove={handleTouch.move}
        onTouchEnd={handleTouch.end}
      >
        <div
          ref={carouselRef}
          className="flex space-x-3 overflow-x-scroll scrollbar-hide snap-x px-2"
        >
          {collections.map((collection) => {
            const images = getAvailableImages(collection)
            const center = String(collection.collection_type) === "5" ? carousel5Index : carousel3Index
            const is5 = String(collection.collection_type) === "5"

            return (
              <div
                key={collection.id}
                className="flex-none w-[calc(50%-6px)] sm:w-[calc(25%-9px)] snap-start"
              >
                <Card className="overflow-hidden border-0 shadow-none">
                  <CardContent className="p-0">
                    <div className="relative w-full h-[280px] sm:h-[320px] flex items-center justify-center">
                      <div className="relative w-[140px] h-[220px] sm:w-[180px] sm:h-[280px] perspective-[1000px]">
                        {images.map((img, i) => {
                          const offset = i - center
                          return (
                            <div
                              key={i}
                              className="absolute w-full h-full transition-all duration-700 ease-in-out"
                              style={getTransformStyle(offset, is5)}
                            >
                              <Link href={`/collection/${collection.id}`} className="block w-full h-full relative">
                                <Image
                                  src={img}
                                  alt={`Image ${i + 1}`}
                                  fill
                                  className="object-cover rounded-xl shadow-md"
                                />
                              </Link>
                            </div>
                          )
                        })}
                      </div>
                      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                        {is5 ? "5-Pack" : "3-Pack"}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col p-2 pt-3 items-center space-y-1.5">
                    <Link href={`/collection/${collection.id}`} className="font-bold hover:underline text-center text-l">
                      {collection.title}
                    </Link>
                    <p className="text-l text-muted-foreground">₹{collection.price.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {is5 ? "5 Items" : "3 Items"} Collection
                    </p>
                    <Button
                      className="flex mt-2 w-full font-bold text-xs h-8"
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

      {/* Navigation (Desktop) */}
      <div className="hidden md:block">
        <Button
          variant="outline"
          size="icon"
          className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
          onClick={() => scrollToIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full"
          onClick={() => scrollToIndex(currentIndex + 1)}
          disabled={currentIndex >= maxIndex}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation Dots (Mobile) */}
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
