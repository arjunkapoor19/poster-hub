"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Star, Grid3X3, LayoutGrid, ArrowLeft, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMobile } from "@/hooks/use-mobile"

import { supabase } from "../../../lib/supabase"
import { useCartStore } from "@/store/cartStore"
import { AddToCartModal } from "../../../components/ui/add-to-cart-modal"
import { useCartDrawerStore } from "@/store/cartDrawerStore"
import Header from "@/components/header"

type Product = {
  id: string | number
  title: string
  price: number
  latest: boolean
  image_1?: string | null
  image_2?: string | null
  image_3?: string | null
  image_4?: string | null
  image_5?: string | null
  collection_type: number
  rating: number
  category: string
}

export default function CategoryProductsPage() {
  const params = useParams()
  const router = useRouter()
  const category = decodeURIComponent(params?.category as string || '')
  
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sortBy, setSortBy] = useState<string>("title")
  const [viewMode, setViewMode] = useState<"carousel" | "grid">("carousel")
  const [error, setError] = useState<string | null>(null)
  
  const carouselRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()
  const addToCart = useCartStore((state) => state.addToCart)
  const { openDrawer } = useCartDrawerStore()

  const itemsPerView = isMobile ? 2 : 4
  const maxIndex = filteredProducts.length > 0 ? Math.max(0, filteredProducts.length - itemsPerView) : 0

  // Fetch products by category
  useEffect(() => {
    const fetchProducts = async () => {
      if (!category) return
      
      setLoading(true)
      setError(null)
      
      try {
        console.log("Fetching products for category:", category)
        
        const { data: fetchedData, error } = await supabase
          .from("packs")
          .select("*")
          .ilike("category", category)

        if (error) {
          console.error("Supabase error:", error)
          setError(`Error fetching products: ${error.message}`)
        } else {
          console.log("Fetched products:", fetchedData)
          const validProducts = (fetchedData ?? []).filter(product => 
            product.category && product.category.toLowerCase().trim() === category.toLowerCase().trim()
          )
          setProducts(validProducts)
          setFilteredProducts(validProducts)
        }
      } catch (error) {
        console.error("Error:", error)
        setError("Failed to load products. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [category])

  // Sort products
  useEffect(() => {
    const sorted = [...products].sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        case "latest":
          return b.latest === a.latest ? 0 : b.latest ? 1 : -1
        default:
          return a.title.localeCompare(b.title)
      }
    })
    setFilteredProducts(sorted)
    setCurrentIndex(0)
  }, [products, sortBy])

  // Modal auto-close
  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => setIsModalOpen(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [isModalOpen])

  // 3D Carousel rotation states
  const [carousel3Rotation, setCarousel3Rotation] = useState(0)
  const [carousel5Rotation, setCarousel5Rotation] = useState(0)

  useEffect(() => {
    if (viewMode !== "carousel" || filteredProducts.length === 0) return
    
    const interval = setInterval(() => {
      setCarousel3Rotation((prev) => (prev + 1) % 3)
      setCarousel5Rotation((prev) => (prev + 1) % 5)
    }, 2000)
    return () => clearInterval(interval)
  }, [viewMode, filteredProducts.length])

  // Carousel navigation
  const scrollToIndex = (index: number) => {
    if (!carouselRef.current || filteredProducts.length === 0) return
    const newIndex = Math.max(0, Math.min(index, maxIndex))
    setCurrentIndex(newIndex)
    const itemWidth = carouselRef.current.scrollWidth / filteredProducts.length
    carouselRef.current.scrollTo({ left: newIndex * itemWidth, behavior: "smooth" })
  }

  const handleNext = () => scrollToIndex(currentIndex + 1)
  const handlePrev = () => scrollToIndex(currentIndex - 1)

  // Touch handlers
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

  // Cart functionality
  const handleAddToCart = (product: Product) => {
    const firstImage = getAvailableImages(product)[0]
    addToCart({
      id: String(product.id),
      name: product.title,
      price: product.price,
      quantity: 1,
      image: firstImage,
    })
    setIsModalOpen(true)
    openDrawer()
  }

  // Image handling
  const getAvailableImages = (product: Product): string[] => {
    const images = [
      product.image_1,
      product.image_2,
      product.image_3,
      ...(product.collection_type === 5 ? [product.image_4, product.image_5] : [])
    ].filter((img): img is string => !!img && img.trim() !== "")

    const total = product.collection_type === 5 ? 5 : 3

    if (images.length === 0) return Array(total).fill("/placeholder.svg")
    const result: string[] = []
    for (let i = 0; i < total; i++) result.push(images[i % images.length])
    return result
  }

  const getCarouselRotation = (type: number) => (type === 5 ? carousel5Rotation : carousel3Rotation)

  const getTransformStyle = (offset: number, isMobile: boolean, type: number) => {
    const is5 = type === 5
    const baseOffset = is5 ? (isMobile ? 25 : 35) : (isMobile ? 40 : 55)
    const scale = Math.max(0.7, 1 - Math.abs(offset) * 0.1)
    const rotateY = offset * 15
    const opacity = Math.max(0.4, 1 - Math.abs(offset) * 0.2)
    return {
      transform: `translateX(${offset * baseOffset}px) scale(${scale}) rotateY(${rotateY}deg)`,
      zIndex: Math.max(1, 10 - Math.abs(offset)),
      opacity,
    }
  }

  // Render star rating
  const renderStars = (rating: number) => {
    const stars = rating || 0
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= stars ? "fill-amber-400 text-amber-400" : "text-zinc-300"
            }`}
          />
        ))}
        <span className="text-xs text-zinc-500 ml-1.5 font-medium">({stars.toFixed(1)})</span>
      </div>
    )
  }

  // Generate product URL
  const getProductUrl = (product: Product) => {
    return `/collection/${product.id}`
  }

  // Format category name for display
  const formatCategoryName = (categoryName: string) => {
    return categoryName
      .split(/[-_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  if (!category) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-xl font-semibold text-zinc-900">Invalid Category</div>
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
            Browse all categories
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-zinc-600 font-medium">Loading {formatCategoryName(category)}...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-xl font-semibold text-red-600">Oops!</div>
          <div className="text-zinc-600">{error}</div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <div className="text-2xl font-semibold text-zinc-900">No products found</div>
            <div className="text-zinc-600">
              We couldn't find any products in "{formatCategoryName(category)}"
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Link href="/">
              <Button>Browse All</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-8">
        <Header />
      <AddToCartModal isOpen={isModalOpen} />
      
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500 pl-6">
        <Link href="/" className="hover:text-zinc-900 transition-colors">Home</Link>
        <span>/</span>
        <span className="text-zinc-900 font-medium">{formatCategoryName(category)}</span>
      </div>
      
      {/* Header */}
        <div className="space-y-3 text-center">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ml-6">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px] border-zinc-200">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Name A-Z</SelectItem>
              <SelectItem value="price-low">Price: Low to High</SelectItem>
              <SelectItem value="price-high">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="latest">Latest First</SelectItem>
            </SelectContent>
          </Select>
          
        </div>
      </div>


        <div className="relative">
          <div
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              ref={carouselRef}
              className="flex space-x-4 overflow-x-scroll scrollbar-hide snap-x px-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {filteredProducts.map((product) => {
                const availableImages = getAvailableImages(product)
                const rotation = getCarouselRotation(product.collection_type)
                const is5 = product.collection_type === 5

                return (
                  <div
                    key={product.id}
                    className="flex-none w-[calc(50%-8px)] sm:w-[calc(25%-12px)] snap-start"
                  >
                    <Card className="overflow-hidden border-0 bg-white shadow-sm hover:shadow-xl transition-all duration-500 group">
                      <CardContent className="p-0">
                        <div className="relative w-full h-[320px] sm:h-[360px] flex items-center justify-center bg-zinc-50">
                          <div
                            className="relative perspective-[1000px]"
                            style={{
                              width: isMobile ? "150px" : "190px",
                              height: isMobile ? "240px" : "300px",
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
                                  key={`${product.id}-${i}`}
                                  className="absolute inset-0 transition-all duration-700 ease-out"
                                  style={getTransformStyle(offset, isMobile, product.collection_type)}
                                >
                                  <Link href={getProductUrl(product)} className="block relative w-full h-full">
                                    <Image
                                      src={img}
                                      alt={`${product.title} - Image ${i + 1}`}
                                      fill
                                      className="object-cover rounded-lg shadow-lg"
                                      sizes={isMobile ? "150px" : "190px"}
                                    />
                                  </Link>
                                </div>
                              )
                            })}
                          </div>

                          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                            <Badge variant="secondary" className="text-xs font-medium bg-white/90 backdrop-blur-sm">
                              {is5 ? "5-Pack" : "3-Pack"}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>

                      <div className="p-5 space-y-3">
                        <Link
                          href={getProductUrl(product)}
                          className="block font-semibold text-zinc-900 hover:text-blue-600 transition-colors line-clamp-2 leading-tight"
                        >
                          {product.title}
                        </Link>
                        
                        {renderStars(product.rating)}
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="text-2xl font-bold text-zinc-900">₹{product.price.toFixed(2)}</div>
                            <div className="text-xs text-zinc-500 font-medium">
                              {is5 ? "5 Items" : "3 Items"} Collection
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          className="w-full h-11 bg-zinc-900 hover:bg-zinc-800 text-white font-medium transition-colors gap-2"
                          onClick={() => handleAddToCart(product)}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </Button>
                      </div>
                    </Card>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="hidden md:block">
            <Button
              variant="outline"
              size="icon"
              className="absolute -left-5 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full z-10 bg-white border-zinc-200 shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute -right-5 top-1/2 h-12 w-12 -translate-y-1/2 rounded-full z-10 bg-white border-zinc-200 shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={handleNext}
              disabled={currentIndex >= maxIndex}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Pagination Dots */}
          {maxIndex > 0 && (
            <div className="mt-6 flex justify-center gap-2 md:hidden">
              {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                <button
                  key={index}
                  className={`h-2 rounded-full transition-all duration-200 ${
                    index === currentIndex ? "w-8 bg-zinc-900" : "w-2 bg-zinc-300"
                  }`}
                  onClick={() => scrollToIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
    </div>
  )
}