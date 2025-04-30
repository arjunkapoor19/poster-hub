"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"

export default function HeroBanner() {
  const isMobile = useMobile()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(true)
  }, [])

  return (
    <div className="relative w-full h-[100svh] md:h-[90vh]">
      <div className="absolute inset-0">
        <Image
          src="/MockUp.png?height=1080&width=1920"
          alt="Featured poster collection"
          fill
          priority
          sizes="100vw"
          className={`object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setLoaded(true)}
          style={{ objectPosition: isMobile ? "center" : "center" }}
        />
<div className="absolute bottom-0 left-0 right-0 h-[43%] bg-gradient-to-t from-background/70 to-transparent pointer-events-none" />
</div>
      <div className="relative flex h-full items-end pb-16 md:pb-24">
        <div className="container px-4">
          <div className="max-w-md space-y-4">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Latest Collection 2025</h1>
            <p className="text-white">Exclusive limited edition prints to brighten your space</p>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
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

