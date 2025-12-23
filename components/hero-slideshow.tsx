"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

// Hero images - you can replace these with actual images in the public folder
// Place them in public/images/hero/ folder and update the paths below
const heroImages = [
  "/hero1.jpg",
  "/hero2.jpg",
  "/hero3.jpg",
  "/hero4.jpg",
];

// Alternative: Use local images from public folder
// Create a folder: public/images/hero/ and add your images there
// const heroImages = [
//   "/images/hero/building-1.jpg",
//   "/images/hero/building-2.jpg",
//   "/images/hero/building-3.jpg",
//   "/images/hero/building-4.jpg",
// ];

export function HeroSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {heroImages.map((src, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={src}
            alt={`Hero image ${index + 1}`}
            fill
            className="object-cover"
            priority={index === 0}
            quality={90}
            unoptimized={src.startsWith("http")}
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/40 to-black/60" />
        </div>
      ))}
      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all backdrop-blur-sm ${
              index === currentIndex
                ? "w-8 bg-white shadow-lg"
                : "w-2 bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

