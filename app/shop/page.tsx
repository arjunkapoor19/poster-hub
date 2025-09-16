"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Star, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMobile } from "@/hooks/use-mobile"

import { supabase } from "../../lib/supabase"
import { useCartStore } from "@/store/cartStore"
import { AddToCartModal } from "../../components/ui/add-to-cart-modal"
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

export default function ShopPage() {
  const router = useRouter()
  
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sortBy, setSortBy] = useState<string>("title")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [error, setError] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(12)
  
  const isMobile = useMobile()
  const addToCart = useCartStore((state) => state.addToCart)
  const { openDrawer } = useCartDrawerStore()

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const startIndex = (currentPage - 1) * productsPerPage
  const endIndex = startIndex + productsPerPage
  const currentProducts = filteredProducts.slice(startIndex, endIndex)

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)
      
      try {
        console.log("Fetching all products...")
        
        const { data: fetchedData, error } = await supabase
          .from("packs")
          .select("*")
          .order('title')

        if (error) {
          console.error("Supabase error:", error)
          setError(`Error fetching products: ${error.message}`)
        } else {
          console.log("Fetched products:", fetchedData)
          const validProducts = (fetchedData ?? []).filter(product => 
            product.category && product.title && product.price
          )
          setProducts(validProducts)
          
          // Extract unique categories
          const uniqueCategories = Array.from(new Set(
            validProducts.map(product => product.category.toLowerCase().trim())
          )).sort()
          setCategories(uniqueCategories)
          
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
  }, [])

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products]
    
    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter(product => 
        product.category.toLowerCase().trim() === categoryFilter
      )
    }
    
    // Sort products
    const sorted = filtered.sort((a, b) => {
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
    setCurrentPage(1) // Reset to first page when filtering/sorting
  }, [products, sortBy, categoryFilter])

  // Modal auto-close
  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => setIsModalOpen(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [isModalOpen])

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

  // 3D Carousel rotation states
  const [carousel3Rotation, setCarousel3Rotation] = useState(0)
  const [carousel5Rotation, setCarousel5Rotation] = useState(0)

  useEffect(() => {
    if (filteredProducts.length === 0) return
    
    const interval = setInterval(() => {
      setCarousel3Rotation((prev) => (prev + 1) % 3)
      setCarousel5Rotation((prev) => (prev + 1) % 5)
    }, 2000)
    return () => clearInterval(interval)
  }, [filteredProducts.length])

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

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1)
    }
  }

  const goToPrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="text-zinc-600 font-medium">Loading products...</div>
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
              {categoryFilter === "all" 
                ? "We couldn't find any products at the moment"
                : `No products found in "${formatCategoryName(categoryFilter)}"`
              }
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setCategoryFilter("all")}>
              Show All Products
            </Button>
            <Link href="/">
              <Button>Go Home</Button>
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
        <span className="text-zinc-900 font-medium">Shop</span>
        {categoryFilter !== "all" && (
          <>
            <span>/</span>
            <span className="text-zinc-900 font-medium">{formatCategoryName(categoryFilter)}</span>
          </>
        )}
      </div>
      
      {/* Header */}
      <div className="space-y-6 px-6">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-zinc-900">
            {categoryFilter === "all" ? "All Products" : formatCategoryName(categoryFilter)}
          </h1>
          <p className="text-zinc-600 max-w-2xl mx-auto">
            {categoryFilter === "all" 
              ? `Discover our complete collection of amazing products`
              : `Browse our ${filteredProducts.length} products in ${formatCategoryName(categoryFilter)}`
            }
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px] border-zinc-200">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {formatCategoryName(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
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
          
          <div className="text-sm text-zinc-500">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} of {filteredProducts.length} products
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentProducts.map((product) => {
            const availableImages = getAvailableImages(product)
            const rotation = getCarouselRotation(product.collection_type)
            const is5 = product.collection_type === 5

            return (
              <Card
                key={product.id}
                className="overflow-hidden border-0 bg-white shadow-sm hover:shadow-xl transition-all duration-500 group"
              >
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
                      <Badge variant="outline" className="text-xs font-medium bg-white/90 backdrop-blur-sm z-10">
                        {formatCategoryName(product.category)}
                      </Badge>
                    </div>
                  </div>

                  {/* Product Info */}
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
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className="px-3 py-2"
            >
              Previous
            </Button>
            
            {/* Page Numbers */}
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page and 2 pages around current
                const showPage = 
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                
                if (!showPage) {
                  // Show ellipsis
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <span key={page} className="px-3 py-2 text-zinc-500">
                        ...
                      </span>
                    )
                  }
                  return null
                }

                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => goToPage(page)}
                    className="px-3 py-2 min-w-[40px]"
                  >
                    {page}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-2"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}