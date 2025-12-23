"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

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
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MailCheck,
  Mail,
  Trash2,
  Download,
  CheckCircle2,
  XCircle,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Id } from "@/convex/_generated/dataModel";

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function NewsletterPage() {
  const router = useRouter();
  const { sessionToken, admin } = useAuthStore();
  const currentAdmin = useQuery(
    api.auth.getCurrentAdmin,
    sessionToken ? { sessionToken } : "skip"
  );
  const subscribers = useQuery(api.newsletter.list, { subscribedOnly: true });
  const allSubscribers = useQuery(api.newsletter.list, {});
  const stats = useQuery(api.newsletter.getStats);
  const removeSubscriber = useMutation(api.newsletter.remove);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubscriber, setSelectedSubscriber] = useState<Id<"newsletterSubscriptions"> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionToken && !admin && !currentAdmin) {
      router.push("/admin/login");
    }
  }, [sessionToken, admin, currentAdmin, router]);

  // GSAP Animations
  useEffect(() => {
    if (typeof window === "undefined" || !gsap || !ScrollTrigger) return;

    const ctx = gsap.context(() => {
      // Animate header
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
        );
      }

      // Animate stats cards
      if (statsRef.current) {
        const cards = statsRef.current.querySelectorAll(".stat-card");
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.15,
            scrollTrigger: {
              trigger: statsRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );

        // Add hover animations
        cards.forEach((card) => {
          card.addEventListener("mouseenter", () => {
            gsap.to(card, {
              scale: 1.02,
              y: -5,
              duration: 0.3,
              ease: "power2.out",
            });
          });

          card.addEventListener("mouseleave", () => {
            gsap.to(card, {
              scale: 1,
              y: 0,
              duration: 0.3,
              ease: "power2.out",
            });
          });
        });
      }

      // Animate table rows
      if (tableRef.current) {
        const rows = tableRef.current.querySelectorAll("tbody tr");
        gsap.fromTo(
          rows,
          { opacity: 0, x: -30 },
          {
            opacity: 1,
            x: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.05,
            scrollTrigger: {
              trigger: tableRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [subscribers, allSubscribers, showAll, searchQuery, stats]);

  if (!currentAdmin && !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const filteredSubscribers = (showAll ? allSubscribers : subscribers)?.filter((sub) =>
    sub.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDelete = async (id: Id<"newsletterSubscriptions">) => {
    if (confirm("Are you sure you want to remove this subscriber?")) {
      await removeSubscriber({ id });
      if (selectedSubscriber === id) {
        setIsDialogOpen(false);
      }
    }
  };

  const handleExport = () => {
    const activeSubscribers = subscribers || [];
    const csv = [
      ["Email", "Subscribed Date"],
      ...activeSubscribers.map((sub) => [
        sub.email,
        new Date(sub.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Newsletter Subscribers</h1>
            <p className="text-muted-foreground mt-1">
              Manage your email subscription list
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="size-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="stat-card border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MailCheck className="size-4 text-green-600 dark:text-green-400" />
                  Active Subscribers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.subscribed}</div>
                <p className="text-xs text-muted-foreground mt-1">Currently subscribed</p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <XCircle className="size-4 text-muted-foreground" />
                  Unsubscribed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.unsubscribed}</div>
                <p className="text-xs text-muted-foreground mt-1">Previously subscribed</p>
              </CardContent>
            </Card>
            <Card className="stat-card border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="size-4 text-primary" />
                  Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">All time subscribers</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Subscribers List</CardTitle>
                <CardDescription>
                  {showAll ? "All subscribers (including unsubscribed)" : "Active subscribers only"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={showAll ? "outline" : "default"}
                  size="sm"
                  onClick={() => setShowAll(false)}
                >
                  Active
                </Button>
                <Button
                  variant={showAll ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowAll(true)}
                >
                  All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {filteredSubscribers.length > 0 ? (
              <div ref={tableRef}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subscribed</TableHead>
                      {showAll && <TableHead>Unsubscribed</TableHead>}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscribers.map((subscriber) => (
                      <TableRow
                        key={subscriber._id}
                        className={!subscriber.subscribed ? "opacity-60" : ""}
                      >
                        <TableCell className="font-medium">{subscriber.email}</TableCell>
                        <TableCell>
                          {subscriber.subscribed ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="size-3" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <XCircle className="size-3" />
                              Unsubscribed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(subscriber.createdAt)}</TableCell>
                        {showAll && (
                          <TableCell>
                            {subscriber.unsubscribedAt
                              ? formatDate(subscriber.unsubscribedAt)
                              : "-"}
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(subscriber._id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                {searchQuery ? "No subscribers found matching your search." : "No subscribers yet."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
