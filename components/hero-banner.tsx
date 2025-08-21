"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export default function HeroBanner() {
  const [posters, setPosters] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPosterIndex, setCurrentPosterIndex] = useState(0)

  useEffect(() => {
    const fetchHeroPosters = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("products")
          .select("image")
          .eq("hero", true)

        if (error) {
          console.error("Supabase Error: Could not fetch hero posters.", error.message)
          setPosters([])
        } else if (data) {
          const urls = data.map((product) => product.image).filter(Boolean) as string[]

          // Fisher-Yates shuffle
          for (let i = urls.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[urls[i], urls[j]] = [urls[j], urls[i]]
          }

          setPosters(urls)
        }
      } catch (err) {
        console.error("Unexpected error fetching posters:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHeroPosters()
  }, [])

  useEffect(() => {
    if (posters.length <= 1) return

    const interval = setInterval(() => {
      setCurrentPosterIndex((prevIndex) => (prevIndex + 1) % posters.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [posters.length])

  const renderCarouselContent = () => {
    if (isLoading) {
      return <div className="w-full h-full bg-gray-900/50 rounded-sm animate-pulse" />
    }

    if (posters.length === 0) {
      return (
        <div className="w-full h-full bg-gray-900 rounded-sm flex items-center justify-center">
          <p className="text-gray-400">No images found</p>
        </div>
      )
    }

    return posters.map((poster, index) => (
      <div key={poster || index} className="absolute inset-0">
        <Image
          src={poster}
          alt={`Hero Poster ${index + 1}`}
          fill
          className={`object-cover rounded-sm transition-opacity duration-1000 ${
            index === currentPosterIndex ? "opacity-100" : "opacity-0"
          }`}
          sizes="(max-width: 768px) 260px, (max-width: 1024px) 285px, 305px"
          priority={index === 0}
        />
      </div>
    ))
  }

  return (
    <div className="relative w-full h-[100svh] md:h-[90vh] overflow-hidden">
      {/* Poster Carousel Area */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="relative mt-[-16vh]">
          <div className="relative w-[300px] h-[410px] md:w-[285px] md:h-[400px] lg:w-[350px] lg:h-[479px]">
            {renderCarouselContent()}
            {posters.length > 0 && (
              <div
                className="absolute inset-0 rounded-sm bg-gradient-to-br from-transparent via-transparent to-black/20"
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      </div>

      {/* Transparent Frame */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <Image
          src="https://c7t7lgq8e6.ufs.sh/f/tzsGLcy3BVWqoV6t9b0GO3hBS5J2gnZDivTW9AFtrYX4qdwH"
          alt="Picture Frame Overlay"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Text & Buttons Container */}
      <div className="relative z-30 flex flex-col justify-between h-full">
        <div className="md:hidden pt-10 px-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Elite Quality. Every Time.
          </h1>
        </div>
        <div className="flex flex-col items-center md:items-start justify-end h-full pb-16 md:pb-24 px-4 text-center md:text-left">
          <div className="max-w-md w-full space-y-4">
            <h1 className="hidden md:block text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
              Elite Quality. Every Time.
            </h1>
            <p className="text-white text-base sm:text-lg">
              No compromises in quality, only the very best.
            </p>
            <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-2 space-y-2 sm:space-y-0 w-full sm:w-auto">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/shop">Shop Now</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/collections">View Collections</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
