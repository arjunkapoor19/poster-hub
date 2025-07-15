"use client"

import { useState } from "react"
import Image from "next/image"

const images = [
  "/img1.png", // Replace with actual images
  "/img2.png",
  "/img3.png",
  "/img4.png",
  "/img5.png",
]

export default function ThreeDCarousel() {
  const [activeIndex, setActiveIndex] = useState(2) // start at center

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % images.length)
  }

  return (
    <div className="relative w-full h-[400px] perspective-[1000px] flex justify-center items-center">
      <div className="relative w-full h-full flex justify-center items-center">
        {images.map((src, i) => {
          const position = (i - activeIndex + images.length) % images.length
          let transform = ""
          let zIndex = 0
          let opacity = 1

          if (position === 0) {
            // center
            transform = "translateX(0px) scale(1) rotateY(0deg)"
            zIndex = 50
          } else if (position === 1 || position === images.length - 1) {
            // sides
            const sign = position === 1 ? 1 : -1
            transform = `translateX(${sign * 160}px) scale(0.8) rotateY(${sign * -30}deg)`
            zIndex = 40
          } else {
            // far sides
            const sign = position > 1 ? 1 : -1
            transform = `translateX(${sign * 280}px) scale(0.6) rotateY(${sign * -45}deg)`
            zIndex = 30
            opacity = 0.4
          }

          return (
            <div
              key={i}
              className="absolute transition-all duration-500 ease-in-out"
              style={{
                transform,
                zIndex,
                opacity,
              }}
            >
              <div className="relative w-[200px] h-[300px] shadow-xl rounded-lg overflow-hidden">
                <Image
                  src={src}
                  alt={`Item ${i}`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )
        })}
      </div>

      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow"
      >
        ◀
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow"
      >
        ▶
      </button>
    </div>
  )
}
