"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { useEffect, useRef } from "react";

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

export default function AboutPage() {
  const representatives = useQuery(api.representatives.list);
  const siteContent = useQuery(api.siteContent.getAll);
  const sectionRef = useRef<HTMLDivElement>(null);
  const ceoRef = useRef<HTMLDivElement>(null);
  const repsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !gsap || !ScrollTrigger) return;
    
    if (sectionRef.current) {
      gsap.fromTo(
        sectionRef.current.children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 80%",
          },
        }
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !gsap || !ScrollTrigger) return;
    
    if (ceoRef.current) {
      gsap.fromTo(
        ceoRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ceoRef.current,
            start: "top 85%",
          },
        }
      );
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !gsap || !ScrollTrigger) return;
    
    if (repsRef.current) {
      gsap.fromTo(
        repsRef.current.children,
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: repsRef.current,
            start: "top 80%",
          },
        }
      );
    }
  }, [representatives]);

  const aboutContent = siteContent?.about_content || 
    "Kamsomarvy is a leading real estate company dedicated to helping you find your perfect home and secure your investment in real estate. With years of experience in the Nigerian real estate market, we provide exceptional service and expertise to guide you through every step of your property journey.";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <PageHeader
          title="About Us"
          description="Your trusted partner in real estate. We've been helping clients secure their investments for over 15 years."
          breadcrumb={[{ label: "About" }]}
          image="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80"
          imageAlt="Modern real estate building"
        />

        {/* About Content */}
        <section ref={sectionRef} className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                {aboutContent}
              </p>
            </div>
          </div>
        </section>

        {/* CEO Section */}
        <section ref={ceoRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-background to-muted/20">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <Badge className="mb-4" variant="outline">Leadership</Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Our CEO</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Meet the visionary leader driving our success
              </p>
            </div>

            <Card className="overflow-hidden border-2 shadow-xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* CEO Image */}
                <div className="relative h-[400px] lg:h-auto bg-linear-to-br from-primary/10 to-secondary/10">
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="relative w-full max-w-sm aspect-square">
                      <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-primary/5 rounded-full blur-3xl" />
                      <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl">
                        {/* Placeholder for CEO image - replace with actual image */}
                        <div className="w-full h-full bg-linear-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                          <span className="text-6xl font-bold text-primary/50">
                            NSJ
                          </span>
                        </div>
                        {/* Uncomment and use when you have the CEO image */}
                        <Image
                          src="/ceo.jpg"
                          alt="Dr. Nnenna Sussan John"
                          fill
                          className="object-cover"
                          priority
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* CEO Content */}
                <div className="p-8 lg:p-12 flex flex-col justify-center bg-card">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-3xl md:text-4xl font-bold mb-2">
                        Dr. Nnenna Sussan John
                      </h3>
                      <Badge className="text-sm px-3 py-1" variant="default">
                        Chief Executive Officer
                      </Badge>
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-4 text-muted-foreground leading-relaxed">
                      <p className="text-lg font-semibold text-foreground">
                        Amb. Dr. (Mrs.) Nnenna J. Njoku-B
                      </p>
                      <p>
                        Amb. Dr. (Mrs.) Nnenna J. Njoku-B is the Managing Director of Kamsomarvy & Co. Ltd, a real estate and construction company based in Abuja, that has been meeting the Housing needs of Residents of FCT and other states for over a Decade and half.
                      </p>
                      <p>
                        She is a Certified Chartered Accountant, an international Public Speaker, Financial Management Consultant, Human Right Advocate and a Writer. She is the former Publicity/ Secretary of Real Estate Development Association of Nigeria (REDAN) North Central Zone as well as the Chairperson Team New Nigeria, North Central Zone.
                      </p>
                      <p>
                        As a renowned Philanthropist, she is the founder of His Kind Foundation, and Roof on a Widow that empowers Women and Children.
                      </p>
                    </div>

                    <div className="pt-4 flex flex-wrap gap-2">
                      <Badge variant="outline">Chartered Accountant</Badge>
                      <Badge variant="outline">Public Speaker</Badge>
                      <Badge variant="outline">Financial Consultant</Badge>
                      <Badge variant="outline">Human Rights Advocate</Badge>
                      <Badge variant="outline">Philanthropist</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Our Representatives */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Our Representatives</h2>
              <p className="text-muted-foreground">
                Meet our professional Estate Agents
              </p>
            </div>

            {representatives && representatives.length > 0 ? (
              <div
                ref={repsRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {representatives.map((rep) => (
                  <RepresentativeCard key={rep._id} representative={rep} />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                No representatives available at the moment.
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function RepresentativeCard({ representative }: { representative: Doc<"representatives"> }) {
  const photoUrl = useQuery(
    api.files.getUrl,
    representative.photo ? { storageId: representative.photo } : "skip"
  );

  const initials = representative.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase();

  return (
    <Card className="text-center hover:shadow-lg transition-shadow">
      <CardContent className="pt-4 pb-4 px-4">
        <div className="relative w-16 h-16 mx-auto mb-3 rounded-full overflow-hidden bg-muted flex items-center justify-center">
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={representative.name}
              width={64}
              height={64}
              className="object-cover rounded-full"
              sizes="64px"
              quality={85}
              loading="lazy"
              placeholder="blur"
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQADAD8A"
            />
          ) : (
            <span className="text-sm font-semibold text-muted-foreground">{initials}</span>
          )}
        </div>
        <h3 className="font-semibold text-base mb-1">{representative.name}</h3>
        <p className="text-xs text-muted-foreground mb-2">{representative.role}</p>
        <a
          href={`tel:${representative.phone}`}
          className="text-xs text-primary hover:underline"
        >
          {representative.phone}
        </a>
      </CardContent>
    </Card>
  );
}

