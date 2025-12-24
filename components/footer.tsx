"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MapPin, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const subscribe = useMutation(api.newsletter.subscribe);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setMessage({ type: "error", text: "Please enter a valid email address" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await subscribe({ email });
      setMessage({ type: "success", text: result.message || "Successfully subscribed!" });
      setEmail("");
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <footer className="border-t bg-background/60 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center">
              <div className="relative size-10 rounded-2xl overflow-hidden">
                <Image
                  src="/kamsologo.png"
                  alt="Kamsomarvy"
                  width={100}
                  height={100}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground max-w-sm">
              Your best partner when you aim to secure your investment in real estate.
              Premium listings, modern experience, and trusted guidance.
            </p>

            <div className="mt-6 rounded-2xl border bg-background/60 p-3">
              <p className="text-sm font-medium">Get market updates</p>
              <p className="mt-1 text-xs text-muted-foreground">
                New listings, price changes, and curated opportunities—no spam.
              </p>
              <form onSubmit={handleSubscribe} className="mt-3 space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Email address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="h-10"
                    aria-label="Email address"
                    required
                  />
                  <Button type="submit" disabled={isSubmitting} className="h-10 gap-2">
                    {isSubmitting ? (
                      "Subscribing..."
                    ) : (
                      <>
                        Subscribe <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>
                </div>
                {message && (
                  <div
                    className={`flex items-center gap-2 text-xs ${
                      message.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {message.type === "success" && <CheckCircle2 className="size-3" />}
                    <span>{message.text}</span>
                  </div>
                )}
              </form>
            </div>
          </div>

          <div className="lg:col-span-3 lg:col-start-6">
            <h3 className="text-sm font-semibold tracking-wide">Quick Links</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/#properties" className="text-muted-foreground hover:text-foreground transition-colors">
                  Properties
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <h3 className="text-sm font-semibold tracking-wide">Get in touch</h3>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 text-foreground/70" />
                <span>No. 22 Kofirodua street, Wuse zone 2, Abuja</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="size-4 text-foreground/70" />
                <span>+234 906 633 3888</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="size-4 text-foreground/70" />
                <span>info@kamsomarvy.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} Kamsomarvy. All rights reserved.</span>
          <span className="text-xs sm:text-sm">
            Built for speed, clarity, and trust.
          </span>
        </div>
      </div>
    </footer>
  );
}

