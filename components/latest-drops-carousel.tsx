// components/LatestDropsCarousel.tsx
"use client"

import type React from "react"
import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useMobile } from "@/hooks/use-mobile"
import { type Product } from "@/lib/shopify" 
import { useCartStore } from "@/store/cartStore"

interface LatestDropsCarouselProps {
  products: Product[];
}

export default function LatestDropsCarousel({ products }: LatestDropsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobile();
  const addToCart = useCartStore((state) => state.addToCart);
  
  const itemsPerView = isMobile ? 2 : 4;
  const maxIndex = Math.max(0, products.length - itemsPerView);

  // --- Touch Swipe Logic ---
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    // Right swipe
    if (distance > 50) handleNext();
    // Left swipe
    if (distance < -50) handlePrev();
    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
  };
  // --- End Touch Swipe Logic ---

  const scrollToIndex = (index: number) => {
    if (!carouselRef.current) return;
    const newIndex = Math.max(0, Math.min(index, maxIndex));
    setCurrentIndex(newIndex);
    const itemWidth = carouselRef.current.scrollWidth / (products.length || 1);
    carouselRef.current.scrollTo({ left: newIndex * itemWidth, behavior: "smooth" });
  };

  const handleNext = () => scrollToIndex(currentIndex + 1);
  const handlePrev = () => scrollToIndex(currentIndex - 1);

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
          {products.map((product) => {
            const firstVariantId = product.variants?.edges[0]?.node.id;
            const imageUrl = product.images?.edges[0]?.node.url || "/placeholder.svg";
            const price = parseFloat(product.priceRange.minVariantPrice.amount);

            return (
              <div key={product.id} className="flex-none w-[calc(50%-8px)] sm:w-[calc(33.333%-16px)] md:w-[calc(25%-16px)] snap-start">
                <Card className="overflow-hidden border shadow-sm">
                  <CardContent className="p-0">
                    <Link href={`/product/${product.handle}`} className="relative block aspect-[2/3] overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={product.title}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                      />
                    </Link>
                  </CardContent>
                  <CardFooter className="flex flex-col p-4 items-center">
                    <Link href={`/product/${product.handle}`} className="font-medium hover:underline text-center">
                      {product.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">₹{price.toFixed(2)}</p>
                    <Button 
                      className="flex flex-grow-1 mt-6 w-full font-bold" 
                      onClick={() => {
                        addToCart({ 
                          id: firstVariantId!,
                          name: product.title, 
                          price: price,
                          quantity: 1, 
                          image: imageUrl 
                        })
                      }}
                      disabled={!firstVariantId}
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

      {/* Navigation UI */}
      <div className="hidden md:block">
        <Button variant="outline" size="icon" className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full" onClick={handlePrev} disabled={currentIndex === 0}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full" onClick={handleNext} disabled={currentIndex >= maxIndex}>
          <ChevronRight className="h-4 w-4" />
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