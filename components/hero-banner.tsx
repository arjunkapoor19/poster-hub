"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"

export default function HeroBanner() {
  const isMobile = useMobile()
  const [loaded, setLoaded] = useState(false)
  const [currentPosterIndex, setCurrentPosterIndex] = useState(0)

  const posters = [
    "https://njrjnitwpwxvgwzawova.supabase.co/storage/v1/object/public/product-images//ChelseaComic.png",
    "https://njrjnitwpwxvgwzawova.supabase.co/storage/v1/object/public/product-images//CopaComic.png",
    "https://njrjnitwpwxvgwzawova.supabase.co/storage/v1/object/public/product-images//WCSemiComic.png",
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPosterIndex((prevIndex) =>
        prevIndex === posters.length - 1 ? 0 : prevIndex + 1
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [posters.length])

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <div className="relative w-full h-[100svh] md:h-[90vh] overflow-hidden">


      {/* Poster Carousel */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="relative mt-[-16vh]">
          <div className="relative w-[260px] h-[370px] md:w-[285px] md:h-[400px] lg:w-[305px] lg:h-[432px]">
            {posters.map((poster, index) => (
              <div key={index} className="absolute inset-0">
                <Image
                  src={poster}
                  alt={`Poster ${index + 1}`}
                  fill
                  className={`object-cover rounded-sm transition-opacity duration-1000 ${
                    index === currentPosterIndex ? "opacity-100" : "opacity-0"
                  }`}
                  sizes="(max-width: 768px) 240px, (max-width: 1024px) 280px, 300px"
                />
                <div
                  className={`absolute inset-0 rounded-sm bg-gradient-to-br from-transparent via-transparent to-black/20 transition-opacity duration-1000 ${
                    index === currentPosterIndex ? "opacity-100" : "opacity-0"
                  }`}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transparent Frame */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <Image
          src="/MockUp.png"
          alt="Picture Frame Overlay"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Gradient overlay at bottom */}

      {/* Text & Buttons Container */}
      <div className="relative z-30 flex flex-col justify-between h-full">
        {/* Mobile Top-Centered Heading */}
        <div className="md:hidden pt-10 px-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Elite Quality. Every Time.
          </h1>
        </div>

        {/* Mobile and Desktop Bottom Section */}
        <div className="flex flex-col items-center md:items-start justify-end h-full pb-16 md:pb-24 px-4 text-center md:text-left">
          <div className="max-w-md w-full space-y-4">
            {/* Desktop Heading */}
            <h1 className="hidden md:block text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-white">
              Elite Quality. Every Time.
            </h1>

            {/* Subtext */}
            <p className="text-white text-base sm:text-lg">
              No compromises in quality, only the very best.
            </p>

            {/* Buttons */}
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
