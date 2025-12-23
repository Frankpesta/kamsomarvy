"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PropertyCard } from "@/components/property-card";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HeroImageSlideshow } from "@/components/hero-image-slideshow";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Search,
  Sparkles,
  Shield,
  Award,
  Users,
  Home as HomeIcon,
  CheckCircle2,
  Star,
  TrendingUp,
  Clock,
} from "lucide-react";
import { FAQSection } from "@/components/faq-section";
import { Card, CardContent } from "@/components/ui/card";

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

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const propertiesRef = useRef<HTMLDivElement>(null);

  const featuredProperties = useQuery(api.properties.list, { featured: true });
  const allProperties = useQuery(api.properties.list, {});
  const siteContent = useQuery(api.siteContent.getAll);

  const heroTitle = siteContent?.hero_title || "Find A Perfect Home To Live With Your Family";
  const heroSubtitle = siteContent?.hero_subtitle || "Kamsomarvy is your best partner when you aim to secure your investment in real estate";
  const hotSalesText = siteContent?.hot_sales_text || "Hot Sales";

  const [query, setQuery] = useState("");
  const [listingType, setListingType] = useState<"all" | "sale" | "rent">("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>("all");

  const availablePropertyTypes = useMemo(() => {
    const types = new Set<string>();
    (allProperties || []).forEach((p) => {
      if (p.propertyType) types.add(p.propertyType);
    });
    return ["all", ...Array.from(types).sort((a, b) => a.localeCompare(b))];
  }, [allProperties]);

  // Show only featured properties or first 10 on homepage
  const displayedProperties = useMemo(() => {
    const props = featuredProperties && featuredProperties.length > 0
      ? featuredProperties
      : (allProperties || []).slice(0, 10);
    return props;
  }, [featuredProperties, allProperties]);

  const filteredProperties = useMemo(() => {
    const q = query.trim().toLowerCase();
    return displayedProperties
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
  }, [displayedProperties, listingType, propertyTypeFilter, query]);

  useEffect(() => {
    if (typeof window === "undefined" || !gsap || !ScrollTrigger) return;
    
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.children,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.2, ease: "power3.out" }
      );
    }
  }, []);

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
  }, [allProperties]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section
          ref={heroRef}
          className="relative py-14 md:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
        >
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 h-[520px] w-[520px] rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-32 -right-28 h-[520px] w-[520px] rounded-full bg-accent/20 blur-3xl" />
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/10 to-transparent" />
          </div>

          <div className="container mx-auto max-w-7xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Column - Text Content */}
              <div className="space-y-8 order-2 lg:order-1">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur">
                  <Sparkles className="size-4 text-primary" />
                  Premium properties. Modern experience.
                </div>

                {/* Main Heading */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
                  <span className="text-foreground">{heroTitle}</span>
                </h1>

                {/* Subtitle */}
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
                  {heroSubtitle}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link href="#properties">
                    <Button size="lg" className="text-base px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all gap-2">
                      Browse properties <ArrowRight className="size-5" />
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button size="lg" variant="outline" className="text-base px-8 py-6 h-auto border-2">
                      Get In Touch
                    </Button>
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8 border-t">
                  <div>
                    <div className="text-3xl md:text-4xl font-semibold text-foreground">500+</div>
                    <div className="text-sm text-muted-foreground mt-1">Properties</div>
                  </div>
                  <div>
                    <div className="text-3xl md:text-4xl font-semibold text-foreground">1000+</div>
                    <div className="text-sm text-muted-foreground mt-1">Happy Clients</div>
                  </div>
                  <div>
                    <div className="text-3xl md:text-4xl font-semibold text-foreground">15+</div>
                    <div className="text-sm text-muted-foreground mt-1">Years Experience</div>
                  </div>
                </div>
              </div>

              {/* Right Column - Image Slideshow */}
              <div className="order-1 lg:order-2 relative">
                <HeroImageSlideshow />
                <div className="absolute -bottom-6 -left-6 hidden lg:block">
                  <div className="rounded-3xl border bg-background/70 p-4 shadow-xl shadow-black/5 backdrop-blur">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex size-10 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/15">
                        <Building2 className="size-5 text-primary" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold leading-none">Verified listings</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Curated for quality and accuracy.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10 hidden lg:block">
            <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex items-start justify-center p-2 bg-background/50 backdrop-blur-sm">
              <div className="w-1 h-3 bg-primary/60 rounded-full"></div>
            </div>
          </div>
        </section>

        {/* Hot Sales Section */}
        {featuredProperties && featuredProperties.length > 0 && (
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-background to-muted/30">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
                  🔥 Limited Time Offers
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">{hotSalesText}</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                  Discover our most sought-after properties with exclusive deals
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProperties.slice(0, 3).map((property) => (
                  <PropertyCard key={property._id} {...property} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Property Listing Section */}
        <section id="properties" className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Featured Properties</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover our handpicked selection of premium properties
              </p>
            </div>

            {/* Search and Filter */}
            <div className="rounded-3xl border bg-background/70 p-4 shadow-lg shadow-black/5 backdrop-blur mb-8 max-w-4xl mx-auto">
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
                  <Select value={listingType} onValueChange={(v) => setListingType(v as typeof listingType)}>
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
                  <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
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

            {/* Properties Grid */}
            <div
              ref={propertiesRef}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProperties?.map((property) => (
                <PropertyCard key={property._id} {...property} />
              ))}
            </div>
            {filteredProperties.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No properties found matching your criteria.
              </div>
            )}
            {filteredProperties.length > 0 && (
              <div className="mt-8 text-center">
                <Link href="/properties">
                  <Button variant="outline" size="lg" className="gap-2">
                    View All Properties <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-background to-muted/30">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur mb-4">
                <Sparkles className="size-4 text-primary" />
                Why Choose Us
              </div>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
                Your Trusted Real Estate Partner
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We combine expertise, integrity, and innovation to deliver exceptional real estate solutions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Verified Properties",
                  description: "All our listings are thoroughly verified for authenticity and legal compliance",
                },
                {
                  icon: Award,
                  title: "15+ Years Experience",
                  description: "Extensive market knowledge and proven track record in real estate",
                },
                {
                  icon: Users,
                  title: "Expert Team",
                  description: "Dedicated professionals committed to finding your perfect property",
                },
                {
                  icon: TrendingUp,
                  title: "Best Investment Value",
                  description: "Strategic locations and properties that offer excellent returns",
                },
              ].map((feature, index) => (
                <Card
                  key={index}
                  className="text-center hover:shadow-lg transition-all duration-300 border bg-card/70 backdrop-blur-sm"
                >
                  <CardContent className="p-6">
                    <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-primary/10 mb-4">
                      <feature.icon className="size-7 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 px-4 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur mb-6">
                  <HomeIcon className="size-4 text-primary" />
                  Our Features
                </div>
                <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6">
                  Everything You Need for Your Real Estate Journey
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  We provide comprehensive services to make your property search and investment process seamless and successful.
                </p>

                <div className="space-y-4">
                  {[
                    "Comprehensive property listings with detailed information",
                    "Expert guidance from experienced real estate professionals",
                    "Legal verification and documentation support",
                    "Flexible payment plans and financing options",
                    "Post-purchase support and property management",
                    "Market insights and investment advice",
                  ].map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-muted-foreground">{feature}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <Link href="/contact">
                    <Button size="lg" className="gap-2">
                      Get Started <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Building2, label: "500+ Properties", color: "bg-primary/10 text-primary" },
                    { icon: Users, label: "1000+ Clients", color: "bg-accent/20 text-accent-foreground" },
                    { icon: Star, label: "Premium Service", color: "bg-primary/10 text-primary" },
                    { icon: Clock, label: "Quick Response", color: "bg-accent/20 text-accent-foreground" },
                  ].map((stat, index) => (
                    <Card
                      key={index}
                      className="text-center border bg-card/70 backdrop-blur-sm hover:shadow-md transition-all"
                    >
                      <CardContent className="p-6">
                        <div className={`inline-flex items-center justify-center size-12 rounded-xl ${stat.color} mb-3 mx-auto`}>
                          <stat.icon className="size-6" />
                        </div>
                        <p className="text-sm font-semibold">{stat.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-accent/20 rounded-full blur-2xl -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQSection
          faqs={[
            {
              question: "How do I schedule a property viewing?",
              answer: "You can schedule a property viewing by contacting us through our contact form, calling us directly, or using the WhatsApp button on any property listing. Our team will coordinate a convenient time for you to visit the property.",
            },
            {
              question: "What payment plans are available?",
              answer: "We offer flexible payment plans tailored to your needs. Options include outright purchase, installment plans, and mortgage financing. Our team will work with you to find the best payment solution that fits your budget.",
            },
            {
              question: "Are the properties legally verified?",
              answer: "Yes, all our properties undergo thorough legal verification. We ensure proper documentation, title verification, and compliance with all regulatory requirements before listing any property.",
            },
            {
              question: "Do you provide property management services?",
              answer: "Yes, we offer comprehensive property management services including maintenance, tenant management, rent collection, and property upkeep. Contact us to learn more about our management packages.",
            },
            {
              question: "What areas do you cover?",
              answer: "We primarily serve the Federal Capital Territory (FCT) and surrounding areas, with a focus on prime locations in Abuja. We also have properties in select locations across Nigeria.",
            },
            {
              question: "How can I list my property for sale or rent?",
              answer: "To list your property, please contact us through our contact form or call us directly. Our team will schedule a property assessment and guide you through the listing process, including photography, documentation, and marketing.",
            },
          ]}
        />
      </main>
      <Footer />
    </div>
  );
}
