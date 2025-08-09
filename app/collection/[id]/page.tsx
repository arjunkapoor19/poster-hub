"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import Footer from "@/components/footer"
import DropdownProducts from "@/components/dropdown"
import RelatedProducts from "@/components/related-products"
import Header from "@/components/header"
import { useCartStore } from "@/store/cartStore"

// Define the Pack type
type Pack = {
  id: string
  title: string
  image_1: string | null
  image_2: string | null
  image_3: string | null
  image_4: string | null
  image_5: string | null
  category: string
  description: string
  price: number
  rating: number
  reviews: number
  collection_type: number // 3 or 5
}

export default function ProductPackPage() {
  const { id } = useParams()
  const [pack, setPack] = useState<Pack | null>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const addToCart = useCartStore((state) => state.addToCart)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchPack = async () => {
      const { data, error } = await supabase
        .from("packs")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        console.error("Error fetching pack:", error)
      } else {
        setPack(data)
      }
      setLoading(false)
    }

    if (id) fetchPack()
  }, [id])

  // Get the images based on collection_type
  const getPackImages = (pack: Pack): string[] => {
    const images: string[] = []
    const imageFields = ['image_1', 'image_2', 'image_3', 'image_4', 'image_5']
    
    for (let i = 0; i < pack.collection_type && i < imageFields.length; i++) {
      const imageKey = imageFields[i] as keyof Pack
      const imageUrl = pack[imageKey] as string | null
      if (imageUrl) {
        images.push(imageUrl)
      }
    }
    
    return images
  }

  // Auto-rotate carousel
  useEffect(() => {
    if (!pack) return

    const packImages = getPackImages(pack)
    if (packImages.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % packImages.length)
    }, 3000) // Change image every 3 seconds

    return () => clearInterval(interval)
  }, [pack])

  const handleDotClick = (index: number) => {
    setCurrentImageIndex(index)
  }

  if (loading) return <div>Loading...</div>
  if (!pack) return <div>Pack not found</div>
  
  const packImages = getPackImages(pack)
  console.log("Description is: ", pack.description)

  return (
    <div className="container mx-auto px-4">
      
      <Header />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Carousel Images */}
        <div className="w-full">
          <div className="relative overflow-hidden rounded-lg">
            <div 
              ref={carouselRef}
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
            >
              {packImages.map((image, index) => (
                <div key={index} className="w-full flex-shrink-0 relative aspect-[1/1.414]">
                  {image ? (
                    <Image
                      src={image}
                      alt={`${pack.title} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      No Image Available
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Navigation arrows */}
            <button
              onClick={() => setCurrentImageIndex((prev) => prev === 0 ? packImages.length - 1 : prev - 1)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            >
              ←
            </button>
            <button
              onClick={() => setCurrentImageIndex((prev) => (prev + 1) % packImages.length)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
            >
              →
            </button>
          </div>

          {/* Carousel indicators/dots */}
          <div className="flex justify-center space-x-2 mt-4">
            {packImages.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? 'bg-black' 
                    : 'bg-gray-300 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>

          {/* Thumbnail strip */}
          <div className="flex space-x-3 mt-4 overflow-x-auto pb-2">
            {packImages.map((image, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`relative flex-shrink-0 w-20 aspect-[1/1.414] rounded border-2 transition-all ${
                  index === currentImageIndex 
                    ? 'border-black' 
                    : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                {image ? (
                  <Image
                    src={image}
                    alt={`${pack.title} - Thumbnail ${index + 1}`}
                    fill
                    className="object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-xs">
                    N/A
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-4xl font-light">{pack.title}</h1>
          <p className="text-gray-500 mt-2">{pack.category}</p>
          <p className="text-sm text-blue-600 mt-1">
            {pack.collection_type}-Piece Collection
          </p>
          <p className="mt-2 text-lg flex items-center">
            <span className="text-yellow-500">⭐ {pack.rating.toFixed(1)}</span> / 5 &bull; {pack.reviews}+ Reviews
          </p>
          
          {/* Pricing */}
          <p className="mt-4 text-2xl font-light ">
            <span className="text-xl line-through text-gray-600">
                ₹{((pack.price) + pack.price * 0.4).toFixed(2)}
            </span> 
            <span className="mx-3">₹{pack.price.toFixed(2)}</span>
            <span className="text-xl bg-black text-white p-2 px-3 border rounded-full">
                Sale
            </span>
          </p>

          <div className="text-sm mt-3">Taxes included. Shipping calculated at checkout.</div>

          <div className="pt-5">
            Size:
            <span className="text-md bg-black text-white p-1 px-3 border rounded-full ml-2 mt-3">
                A4
            </span>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4 mt-4">
            <Button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="bg-white text-black border border-black hover:bg-gray-200 rounded-sm">-</Button>
            <span className="text-xl font-bold">{quantity}</span>
            <Button onClick={() => setQuantity(quantity + 1)} className="bg-white text-black border border-black hover:bg-gray-200 rounded-sm">+</Button>
          </div>
          
          {/* Collection Features */}
          <div className="mt-4 text-sm text-gray-700">
            <p>🔥 High-resolution prints with rich, true-to-life colors</p>
            <p>💧 Printed on durable, gallery-grade waterproof paper</p>
            <p>🎁 Perfect for gifting or creating a cohesive art collection</p>
            <p>📦 All {pack.collection_type} pieces included in one package</p>
          </div>
          
          <Button 
            className="mt-6 w-full font-bold" 
            onClick={() => addToCart({ 
              id: pack.id, 
              name: pack.title, 
              price: pack.price, 
              quantity: quantity, 
              image: packImages[0] || "/placeholder.svg" 
            })}
          >
            Add {pack.collection_type}-Piece Collection to Cart
          </Button>
        </div>
      </div>

      <div className="mt-5">
        <DropdownProducts description={pack.description} />
      </div>

      <div className="mb-8">
        <RelatedProducts category={pack.category} tableName="packs" currentPackId={pack.id} />
      </div>

      <Footer />
    </div>
  )
}