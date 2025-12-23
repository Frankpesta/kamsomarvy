"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PropertyCard } from "@/components/property-card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

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

const ITEMS_PER_PAGE = 12;

export default function PropertiesPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [listingType, setListingType] = useState<"all" | "sale" | "rent">(
    (searchParams.get("type") as "all" | "sale" | "rent") || "all"
  );
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const propertiesRef = useRef<HTMLDivElement>(null);

  const allProperties = useQuery(api.properties.list, {});

  const availablePropertyTypes = useMemo(() => {
    const types = new Set<string>();
    (allProperties || []).forEach((p) => {
      if (p.propertyType) types.add(p.propertyType);
    });
    return ["all", ...Array.from(types).sort((a, b) => a.localeCompare(b))];
  }, [allProperties]);

  const filteredProperties = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (allProperties || [])
      .filter((p) => {
        if (listingType === "sale") return p.category === "For Sale";
        if (listingType === "rent") return p.category === "For Rent";
        return true;
      })
      .filter((p) => {
        if (propertyTypeFilter === "all") return true;
        return p.propertyType === propertyTypeFilter;
      })
      .filter((p) => {
        if (!q) return true;
        const haystack = [
          p.title,
          p.location,
          p.address,
          p.propertyType,
          p.buildingType,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
  }, [allProperties, listingType, propertyTypeFilter, query]);

  const totalPages = Math.ceil(filteredProperties.length / ITEMS_PER_PAGE);
  const paginatedProperties = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProperties.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProperties, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, listingType, propertyTypeFilter]);

  useEffect(() => {
    if (typeof window === "undefined" || !gsap || !ScrollTrigger) return;
    
    if (propertiesRef.current) {
      gsap.fromTo(
        propertiesRef.current.children,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: propertiesRef.current,
            start: "top 80%",
          },
        }
      );
    }
  }, [paginatedProperties]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <PageHeader
          title="All Properties"
          description="Browse our complete collection of premium real estate listings"
          breadcrumb={[{ label: "Properties" }]}
          image="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80"
          imageAlt="Real estate properties"
        />

        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-background">
          <div className="container mx-auto max-w-7xl">
            {/* Search and Filter */}
            <div className="rounded-3xl border bg-background/70 p-4 shadow-lg shadow-black/5 backdrop-blur mb-8">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-center">
                <div className="md:col-span-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by location, address, or keyword…"
                      className="h-11 pl-9 rounded-2xl"
                    />
                  </div>
                </div>
                <div className="md:col-span-3">
                  <Select
                    value={listingType}
                    onValueChange={(v) => setListingType(v as typeof listingType)}
                  >
                    <SelectTrigger className="h-11 rounded-2xl">
                      <SelectValue placeholder="Listing type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All listings</SelectItem>
                      <SelectItem value="sale">For sale</SelectItem>
                      <SelectItem value="rent">For rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-3">
                  <Select
                    value={propertyTypeFilter}
                    onValueChange={setPropertyTypeFilter}
                  >
                    <SelectTrigger className="h-11 rounded-2xl">
                      <SelectValue placeholder="Property type" />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePropertyTypes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t === "all" ? "Any type" : t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Results count */}
            <div className="mb-6 text-sm text-muted-foreground">
              Showing {paginatedProperties.length} of {filteredProperties.length} properties
            </div>

            {/* Properties Grid */}
            {paginatedProperties.length > 0 ? (
              <>
                <div
                  ref={propertiesRef}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                >
                  {paginatedProperties.map((property) => (
                    <PropertyCard key={property._id} {...property} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="size-4" />
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(
                          (page) =>
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                        )
                        .map((page, index, array) => (
                          <div key={page} className="flex items-center gap-1">
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2 text-muted-foreground">...</span>
                            )}
                            <Button
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="min-w-[40px]"
                            >
                              {page}
                            </Button>
                            {index < array.length - 1 &&
                              array[index + 1] !== page + 1 && (
                                <span className="px-2 text-muted-foreground">...</span>
                              )}
                          </div>
                        ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <p className="text-lg text-muted-foreground mb-4">
                  No properties found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery("");
                    setListingType("all");
                    setPropertyTypeFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      }
    >
      <PropertiesPageContent />
    </Suspense>
  );
}
