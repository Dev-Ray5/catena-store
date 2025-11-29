"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import { cn } from "@/app/lib/utils"

interface ImageSliderProps {
  images: string[]
  alt: string
}

export function ImageSlider({ images, alt }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-muted flex items-center justify-center rounded-lg">
        <span className="text-muted-foreground">No images available</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-square bg-muted rounded-lg overflow-hidden group">
        <Image src={images[currentIndex] || "/placeholder.svg"} alt={alt} fill className="object-cover" priority />

        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "relative h-16 w-16 rounded border-2 flex-shrink-0 overflow-hidden",
                currentIndex === index ? "border-primary" : "border-border",
              )}
            >
              <Image src={image || "/placeholder.svg"} alt={`${alt} ${index}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
