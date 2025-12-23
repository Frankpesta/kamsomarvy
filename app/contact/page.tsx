"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useRef, useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import Image from "next/image";

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

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const representatives = useQuery(api.representatives.list);
  const submitContact = useMutation(api.contact.submit);
  const sectionRef = useRef<HTMLDivElement>(null);
  const repsRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
  });

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

  const onSubmit = async (data: ContactFormValues) => {
    setIsSubmitting(true);
    try {
      await submitContact({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
      });
      setSubmitSuccess(true);
      reset();
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error("Failed to submit contact form:", error);
      alert("Failed to submit. Please try again or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <PageHeader
          title="Get In Touch"
          description="We're here to help you find your perfect property. Reach out to us through any of the channels below."
          breadcrumb={[{ label: "Contact" }]}
          image="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80"
          imageAlt="Contact us"
        />

        {/* Contact Information */}
        <section ref={sectionRef} className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardContent className="pt-6 text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Address</h3>
                  <p className="text-sm text-muted-foreground">
                    No. 22 Kofirodua street,<br />
                    Wuse zone 2, Abuja
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Phone className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Phone</h3>
                  <a
                    href="tel:+2349066333888"
                    className="text-sm text-primary hover:underline"
                  >
                    +234 906 633 3888
                  </a>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <Mail className="h-8 w-8 mx-auto mb-4 text-primary" />
                  <h3 className="font-semibold mb-2">Email</h3>
                  <a
                    href="mailto:info@kamsomarvy.com"
                    className="text-sm text-primary hover:underline"
                  >
                    info@kamsomarvy.com
                  </a>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
              {/* Contact Form */}
              <Card className="flex flex-col">
                <CardContent className="pt-6 flex-1 flex flex-col">
                  <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
                  {submitSuccess && (
                    <div className="mb-4 p-4 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">
                      Thank you! Your message has been received. We'll get back to you soon.
                    </div>
                  )}
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        {...register("name")}
                        placeholder="Your name"
                        disabled={isSubmitting}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email")}
                        placeholder="your.email@example.com"
                        disabled={isSubmitting}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        {...register("phone")}
                        placeholder="+234 000 000 0000"
                        disabled={isSubmitting}
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        {...register("message")}
                        placeholder="Your message..."
                        rows={5}
                        disabled={isSubmitting}
                      />
                      {errors.message && (
                        <p className="text-sm text-destructive mt-1">
                          {errors.message.message}
                        </p>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      <Send className="mr-2 h-4 w-4" />
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Representatives */}
              <Card className="flex flex-col">
                <CardContent className="pt-6 flex-1 flex flex-col">
                  <h2 className="text-2xl font-bold mb-6">Our Representatives</h2>
                  {representatives && representatives.length > 0 ? (
                    <div ref={repsRef} className="space-y-4 flex-1">
                      {representatives.map((rep) => (
                        <RepresentativeCard key={rep._id} representative={rep} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No representatives available at the moment.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4 pb-4 px-4">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted flex items-center justify-center shrink-0">
            {photoUrl ? (
              <Image
                src={photoUrl}
                alt={representative.name}
                width={48}
                height={48}
                className="object-cover rounded-full"
                sizes="48px"
                quality={85}
                loading="lazy"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQADAD8A"
              />
            ) : (
              <span className="text-xs font-semibold text-muted-foreground">{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">{representative.name}</h3>
            <p className="text-xs text-muted-foreground">{representative.role}</p>
            <a
              href={`tel:${representative.phone}`}
              className="text-xs text-primary hover:underline mt-0.5 inline-block"
            >
              {representative.phone}
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

