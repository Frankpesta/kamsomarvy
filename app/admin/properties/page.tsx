"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Building2,
  DollarSign,
  TrendingUp,
  MapPin,
  Home,
  Hammer,
  CheckCircle2,
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
import { AdminLayout } from "@/components/admin/admin-layout";
import Image from "next/image";

export default function AdminPropertiesPage() {
  const router = useRouter();
  const { sessionToken, admin } = useAuthStore();
  const currentAdmin = useQuery(
    api.auth.getCurrentAdmin,
    sessionToken ? { sessionToken } : "skip"
  );
  const properties = useQuery(api.properties.list, {});
  const stats = useQuery(api.properties.getStats);
  const deleteProperty = useMutation(api.properties.remove);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
    
    // Type guard: gsap is guaranteed to be non-null here
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

      // Animate stats cards
      if (statsRef.current) {
        const cards = statsRef.current.querySelectorAll(".stat-card");
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
              trigger: statsRef.current,
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

      // Animate property type stats cards
      const propertyTypeStats = document.querySelector(".property-type-stats");
      if (propertyTypeStats) {
        const cards = propertyTypeStats.querySelectorAll(".stat-card");
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
              trigger: propertyTypeStats,
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

      // Animate table
      if (tableRef.current) {
        const rows = tableRef.current.querySelectorAll("tbody tr");
        gsapInstance.fromTo(
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
  }, [properties, stats]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;
    setDeletingId(id);
    try {
      await deleteProperty({ id: id as Id<"properties"> });
    } catch {
      alert("Failed to delete property");
    } finally {
      setDeletingId(null);
    }
  };

  if (!currentAdmin && !admin) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div ref={headerRef} className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Properties</h1>
            <p className="text-muted-foreground mt-1">Manage all property listings</p>
          </div>
          <Link href="/admin/properties/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="stat-card border-2 hover:border-primary/50 transition-colors bg-linear-to-br from-background to-muted/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Properties</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground mt-1">All listings</p>
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

        {/* Property Type Stats */}
        {stats && (
          <div className="property-type-stats grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="stat-card border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Land</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Home className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.land}</div>
                <p className="text-xs text-muted-foreground mt-1">Land properties</p>
              </CardContent>
            </Card>
            <Card className="stat-card border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Carcass</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Hammer className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.carcass}</div>
                <p className="text-xs text-muted-foreground mt-1">Carcass properties</p>
              </CardContent>
            </Card>
            <Card className="stat-card border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pre-Finish</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.preFinish}</div>
                <p className="text-xs text-muted-foreground mt-1">Pre-finish properties</p>
              </CardContent>
            </Card>
            <Card className="stat-card border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Finished</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.finished}</div>
                <p className="text-xs text-muted-foreground mt-1">Finished properties</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Properties Table */}
        <Card ref={tableRef} className="border-2">
          <CardHeader>
            <CardTitle>All Properties</CardTitle>
          </CardHeader>
          <CardContent>
            {properties && properties.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property) => (
                      <PropertyRow
                        key={property._id}
                        property={property}
                        onDelete={handleDelete}
                        isDeleting={deletingId === property._id}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No properties found. Add your first property!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

interface PropertyRowProps {
  property: Doc<"properties">;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

function PropertyRow({ property, onDelete, isDeleting }: PropertyRowProps) {
  const imageUrl = useQuery(
    api.files.getUrl,
    property.images && property.images.length > 0
      ? { storageId: property.images[0] }
      : "skip"
  );

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <TableRow>
      <TableCell>
        {imageUrl ? (
          <div className="relative w-16 h-16">
            <Image
              src={imageUrl}
              alt={property.title}
              fill
              className="object-cover rounded"
            />
          </div>
        ) : (
          <div className="w-16 h-16 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
            No Image
          </div>
        )}
      </TableCell>
      <TableCell className="font-medium">{property.title}</TableCell>
      <TableCell>{formatPrice(property.price)}</TableCell>
      <TableCell>
        <Badge variant="secondary">{property.category}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{property.propertyType}</Badge>
      </TableCell>
      <TableCell>
        {property.featured ? (
          <Badge>Featured</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Link href={`/properties/${property._id}`}>
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/admin/properties/${property._id}/edit`}>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(property._id)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

