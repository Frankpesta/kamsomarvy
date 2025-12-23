"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  MessageCircle,
  BedDouble,
  Building,
  Ruler,
  MapPin,
  Tag,
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef, use } from "react";

// Lazy load GSAP to avoid SSR issues
let gsap: typeof import("gsap").gsap | null = null;
let ScrollTrigger: typeof import("gsap/ScrollTrigger").ScrollTrigger | null = null;

if (typeof window !== "undefined") {
  Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
    ([gsapModule, scrollTriggerModule]) => {
      gsap = gsapModule.gsap;
      ScrollTrigger = scrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);
    }
  );
}

export default function PropertyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const propertyId = id as Id<"properties">;
  const property = useQuery(api.properties.get, { id: propertyId });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageUrls = useQuery(
    api.files.getUrls,
    property?.images ? { storageIds: property.images } : "skip"
  );
  const slideshowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (imageUrls && imageUrls.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length);
      }, 5000); // Change image every 5 seconds

      return () => clearInterval(interval);
    }
  }, [imageUrls]);

  useEffect(() => {
    if (typeof window === "undefined" || !gsap || !ScrollTrigger) return;
    
    if (slideshowRef.current) {
      gsap.fromTo(
        slideshowRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.8, ease: "power2.out" }
      );
    }
  }, []);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleEnquiry = () => {
    if (!property) return;

    const message = encodeURIComponent(
      `Hello! I'm interested in this property:\n\n` +
        `*${property.title}*\n` +
        `Price: ${formatPrice(property.price)}\n` +
        `Location: ${property.address}\n` +
        `Type: ${property.propertyType} - ${property.buildingType}\n` +
        `Bedrooms: ${property.bedrooms}\n` +
        `Size: ${property.size}\n\n` +
        `Please provide more information.`
    );

    const whatsappUrl = `https://wa.me/2349077888838?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <PageHeader
          title={property.title}
          description={property.address}
          breadcrumb={[
            { label: "Properties", href: "/properties" },
            { label: property.title },
          ]}
          image={imageUrls && imageUrls.length > 0 ? imageUrls[0] : undefined}
          imageAlt={property.title}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Images and Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <div ref={slideshowRef} className="space-y-4">
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-muted border shadow-lg">
                  {imageUrls && imageUrls.length > 0 ? (
                    <>
                      <Image
                        src={imageUrls[currentImageIndex]}
                        alt={`${property.title} - Image ${currentImageIndex + 1}`}
                        fill
                        className="object-cover"
                        priority
                      />
                      {imageUrls.length > 1 && (
                        <>
                          <button
                            onClick={() =>
                              setCurrentImageIndex(
                                (prev) => (prev - 1 + imageUrls.length) % imageUrls.length
                              )
                            }
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background backdrop-blur-sm text-foreground p-3 rounded-full shadow-lg transition-all hover:scale-110"
                            aria-label="Previous image"
                          >
                            <ChevronLeft className="size-5" />
                          </button>
                          <button
                            onClick={() =>
                              setCurrentImageIndex((prev) => (prev + 1) % imageUrls.length)
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background backdrop-blur-sm text-foreground p-3 rounded-full shadow-lg transition-all hover:scale-110"
                            aria-label="Next image"
                          >
                            <ChevronRight className="size-5" />
                          </button>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-background/60 backdrop-blur-sm px-3 py-2 rounded-full">
                            {imageUrls.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`h-2 rounded-full transition-all ${
                                  index === currentImageIndex
                                    ? "w-8 bg-primary"
                                    : "w-2 bg-foreground/40 hover:bg-foreground/60"
                                }`}
                                aria-label={`Go to image ${index + 1}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-linear-to-br from-muted to-muted/50">
                      <div className="text-center">
                        <Building className="size-12 mx-auto mb-2 opacity-50" />
                        <p>No Images Available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {imageUrls && imageUrls.length > 1 && (
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {imageUrls.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                          index === currentImageIndex
                            ? "border-primary shadow-md scale-105"
                            : "border-border opacity-60 hover:opacity-100 hover:border-primary/50"
                        }`}
                      >
                        <Image
                          src={url}
                          alt={`Thumbnail ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Property Details */}
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">{property.category}</Badge>
                          {property.featured && (
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-semibold mb-2">
                          {property.title}
                        </h2>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="size-4" />
                          <span className="text-sm">{property.address}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-3xl md:text-4xl font-bold text-primary mt-4">
                      {formatPrice(property.price)}
                    </div>
                  </div>

                  <Separator />

                  {/* Property Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-xl border bg-background/50 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <BedDouble className="size-4" />
                        <span className="text-xs">Bedrooms</span>
                      </div>
                      <p className="text-xl font-semibold">{property.bedrooms}</p>
                    </div>
                    <div className="rounded-xl border bg-background/50 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Ruler className="size-4" />
                        <span className="text-xs">Size</span>
                      </div>
                      <p className="text-xl font-semibold">{property.size}</p>
                    </div>
                    <div className="rounded-xl border bg-background/50 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Building className="size-4" />
                        <span className="text-xs">Type</span>
                      </div>
                      <p className="text-sm font-semibold line-clamp-1">
                        {property.propertyType}
                      </p>
                    </div>
                    <div className="rounded-xl border bg-background/50 p-4">
                      <div className="flex items-center gap-2 text-muted-foreground mb-1">
                        <Tag className="size-4" />
                        <span className="text-xs">Building</span>
                      </div>
                      <p className="text-sm font-semibold line-clamp-1">
                        {property.buildingType}
                      </p>
                    </div>
                  </div>

                  {property.features && property.features.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-4 text-lg">Features & Amenities</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {property.features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/50"
                            >
                              <div className="size-1.5 rounded-full bg-primary" />
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {property.description && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-3 text-lg">Description</h3>
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                          {property.description}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - CTA and Quick Info */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {formatPrice(property.price)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {property.category}
                      </p>
                    </div>

                    <Separator />

                    <Button
                      size="lg"
                      className="w-full gap-2"
                      onClick={handleEnquiry}
                    >
                      <MessageCircle className="size-5" />
                      Make Enquiry
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: property.title,
                              text: property.description || property.title,
                              url: window.location.href,
                            });
                          } else {
                            navigator.clipboard.writeText(window.location.href);
                            alert("Link copied to clipboard!");
                          }
                        }}
                      >
                        <Share2 className="size-4" />
                        Share
                      </Button>
                      <Button variant="outline" size="icon">
                        <Heart className="size-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Property Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Location</span>
                        <span className="font-medium">{property.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Property Type</span>
                        <span className="font-medium">{property.propertyType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Building Type</span>
                        <span className="font-medium">{property.buildingType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Bedrooms</span>
                        <span className="font-medium">{property.bedrooms}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Size</span>
                        <span className="font-medium">{property.size}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

