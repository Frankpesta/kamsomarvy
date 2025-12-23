"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdminLayout } from "@/components/admin/admin-layout";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Building2, 
  TrendingUp,
  DollarSign,
  MapPin,
  Mail,
  MailCheck,
  ArrowRight,
  Activity,
  Users,
} from "lucide-react";

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

export default function AdminDashboardPage() {
  const router = useRouter();
  const { sessionToken, admin } = useAuthStore();
  const currentAdmin = useQuery(
    api.auth.getCurrentAdmin,
    sessionToken ? { sessionToken } : "skip"
  );
  const stats = useQuery(api.properties.getStats);
  const contactStats = useQuery(api.contact.list, {});
  const newsletterStats = useQuery(api.newsletter.getStats);
  const recentSubmissions = useQuery(api.contact.list, {});

  const headerRef = useRef<HTMLDivElement>(null);
  const mainStatsRef = useRef<HTMLDivElement>(null);
  const secondaryStatsRef = useRef<HTMLDivElement>(null);
  const recentActivityRef = useRef<HTMLDivElement>(null);
  const chartsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionToken && !admin && !currentAdmin) {
      router.push("/admin/login");
    }
  }, [sessionToken, admin, currentAdmin, router]);

  // GSAP Animations
  useEffect(() => {
    if (typeof window === "undefined" || !gsap || !ScrollTrigger) return;

    const gsapInstance = gsap;

    const ctx = gsapInstance.context(() => {
      // Animate header
      if (headerRef.current) {
        gsapInstance.fromTo(
          headerRef.current,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
        );
      }

      // Animate main stats cards with stagger
      if (mainStatsRef.current) {
        const cards = mainStatsRef.current.querySelectorAll(".stat-card");
        gsapInstance.fromTo(
          cards,
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: mainStatsRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );

        // Add hover animations
        cards.forEach((card) => {
          card.addEventListener("mouseenter", () => {
            gsapInstance.to(card, {
              scale: 1.02,
              y: -5,
              duration: 0.3,
              ease: "power2.out",
            });
          });

          card.addEventListener("mouseleave", () => {
            gsapInstance.to(card, {
              scale: 1,
              y: 0,
              duration: 0.3,
              ease: "power2.out",
            });
          });
        });
      }

      // Animate secondary stats
      if (secondaryStatsRef.current) {
        const cards = secondaryStatsRef.current.querySelectorAll(".secondary-card");
        gsapInstance.fromTo(
          cards,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.15,
            scrollTrigger: {
              trigger: secondaryStatsRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );

        // Add hover animations
        cards.forEach((card) => {
          card.addEventListener("mouseenter", () => {
            gsapInstance.to(card, {
              scale: 1.02,
              x: 5,
              duration: 0.3,
              ease: "power2.out",
            });
          });

          card.addEventListener("mouseleave", () => {
            gsapInstance.to(card, {
              scale: 1,
              x: 0,
              duration: 0.3,
              ease: "power2.out",
            });
          });
        });
      }

      // Animate recent activity
      if (recentActivityRef.current) {
        gsapInstance.fromTo(
          recentActivityRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: recentActivityRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );

        // Animate activity items
        const items = recentActivityRef.current.querySelectorAll(".activity-item");
        gsapInstance.fromTo(
          items,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: recentActivityRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      // Animate charts
      if (chartsRef.current) {
        gsapInstance.fromTo(
          chartsRef.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: chartsRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [stats, contactStats, newsletterStats, recentSubmissions]);

  if (!currentAdmin && !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const unreadContacts = contactStats?.filter((c) => !c.read).length || 0;
  const recentContacts = recentSubmissions?.slice(0, 5) || [];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div ref={headerRef} className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, <span className="font-medium text-foreground">{currentAdmin?.name || admin?.name}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin/contacts">
              <Button variant="outline" className="gap-2">
                <Mail className="size-4" />
                Messages
                {unreadContacts > 0 && (
                  <Badge variant="default" className="ml-1 px-1.5 py-0 text-xs">
                    {unreadContacts}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Main Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="stat-card border-2 hover:border-primary/50 transition-colors bg-linear-to-br from-background to-muted/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Properties</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">Active listings</p>
              </CardContent>
            </Card>
            <Card className="stat-card border-2 hover:border-primary/50 transition-colors bg-linear-to-br from-background to-muted/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">For Sale</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.forSale}</div>
                <p className="text-xs text-muted-foreground mt-1">Available for purchase</p>
              </CardContent>
            </Card>
            <Card className="stat-card border-2 hover:border-primary/50 transition-colors bg-linear-to-br from-background to-muted/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">For Rent</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.forRent}</div>
                <p className="text-xs text-muted-foreground mt-1">Rental properties</p>
              </CardContent>
            </Card>
            <Card className="stat-card border-2 hover:border-primary/50 transition-colors bg-linear-to-br from-background to-muted/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Featured</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.featured}</div>
                <p className="text-xs text-muted-foreground mt-1">Featured listings</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="secondary-card border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="size-4 text-primary" />
                Contact Messages
              </CardTitle>
              <CardDescription>Inquiries and submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{contactStats?.length || 0}</span>
                <span className="text-sm text-muted-foreground">total</span>
              </div>
              {unreadContacts > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="default" className="text-xs">
                    {unreadContacts} unread
                  </Badge>
                </div>
              )}
              <Link href="/admin/contacts" className="mt-4 inline-block">
                <Button variant="ghost" size="sm" className="gap-2">
                  View all <ArrowRight className="size-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="secondary-card border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MailCheck className="size-4 text-primary" />
                Newsletter Subscribers
              </CardTitle>
              <CardDescription>Email subscription list</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{newsletterStats?.subscribed || 0}</span>
                <span className="text-sm text-muted-foreground">active</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {newsletterStats?.total || 0} total subscribers
              </p>
              <Link href="/admin/newsletter" className="mt-4 inline-block">
                <Button variant="ghost" size="sm" className="gap-2">
                  Manage <ArrowRight className="size-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="size-4 text-primary" />
                Representatives
              </CardTitle>
              <CardDescription>Team members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">-</span>
                <span className="text-sm text-muted-foreground">team members</span>
              </div>
              <Link href="/admin/representatives" className="mt-4 inline-block">
                <Button variant="ghost" size="sm" className="gap-2">
                  Manage <ArrowRight className="size-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        {recentContacts.length > 0 && (
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="size-4 text-primary" />
                    Recent Contact Messages
                  </CardTitle>
                  <CardDescription>Latest inquiries from visitors</CardDescription>
                </div>
                <Link href="/admin/contacts">
                  <Button variant="ghost" size="sm" className="gap-2">
                    View all <ArrowRight className="size-3" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{contact.name}</p>
                        {!contact.read && (
                          <Badge variant="default" className="text-xs">New</Badge>
                        )}
                        {contact.replied && (
                          <Badge variant="secondary" className="text-xs">Replied</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {contact.email} • {new Date(contact.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Link href="/admin/contacts">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts */}
        {stats && (
          <div ref={chartsRef} className="mt-8">
            <DashboardCharts stats={stats} />
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

