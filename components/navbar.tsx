"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowRight, Menu, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

function Navbar() {
  const pathname = usePathname();
  const { sessionToken, admin, clearSession } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentAdminQuery = useQuery(
    api.auth.getCurrentAdmin,
    sessionToken ? { sessionToken } : "skip"
  );
  
  // Type guard to safely extract admin properties
  const getAdminProperty = <T,>(adminData: unknown, property: string): T | null => {
    if (adminData && typeof adminData === "object" && property in adminData) {
      return (adminData as Record<string, T>)[property];
    }
    return null;
  };

  const currentAdminName = getAdminProperty<string>(currentAdminQuery, "name");
  const adminName = getAdminProperty<string>(admin, "name");
  const displayName = currentAdminName || adminName || "Admin";

  const isAdmin = !!currentAdminQuery || !!admin;
  const isAdminPage = pathname?.startsWith("/admin");

  const handleLogout = () => {
    clearSession();
    window.location.href = "/";
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/70 backdrop-blur-xl supports-backdrop-filter:bg-background/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between gap-4">
          <Link href="/" className="flex items-center">
            <div className="relative rounded-xl overflow-hidden">
              <Image
                src="/kamsologo.png"
                alt="Kamsomarvy"
                width={170}
                height={170}
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border bg-background/60 p-1 shadow-sm">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={[
                      "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="ml-2 flex items-center gap-2">
              <ThemeToggle />
              <Link href="/#properties">
                <Button size="sm" className="gap-2">
                  Explore listings <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
            {isAdmin && !isAdminPage && (
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  Admin Dashboard
                </Button>
              </Link>
            )}
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    {displayName}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-lg border bg-background/70 p-2 shadow-sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-6 pt-2">
            <div className="rounded-2xl border bg-background/70 p-3 shadow-sm backdrop-blur">
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={[
                      "block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      pathname === link.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60",
                    ].join(" ")}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl border bg-background/60 px-3 py-2">
                <span className="text-sm text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>

              <div className="mt-3 grid gap-2">
                <Link href="/#properties" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full gap-2">
                    Explore listings <ArrowRight className="size-4" />
                  </Button>
                </Link>
                {isAdmin && !isAdminPage && (
                  <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
              </div>

              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 w-full"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export { Navbar };

