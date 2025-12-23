"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { BedDouble, Building, MapPin, Ruler, Tag } from "lucide-react";

interface PropertyCardProps {
  _id: Id<"properties">;
  title: string;
  price: number;
  location: string;
  address: string;
  size: string;
  bedrooms: number;
  propertyType: string;
  category: string;
  buildingType: string;
  images: Id<"_storage">[];
  featured?: boolean;
}

export function PropertyCard({
  _id,
  title,
  price,
  location,
  address,
  size,
  bedrooms,
  propertyType,
  category,
  buildingType,
  images,
  featured,
}: PropertyCardProps) {
  const imageUrl = images.length > 0 
    ? useQuery(api.files.getUrl, { storageId: images[0] }) 
    : null;

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Link href={`/properties/${_id}`}>
      <Card className="group relative overflow-hidden cursor-pointer h-full border bg-card/70 backdrop-blur-sm shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-black/20">
        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute -inset-px rounded-xl bg-linear-to-br from-primary/15 via-transparent to-accent/18" />
        </div>

        <div className="relative aspect-16/10 w-full overflow-hidden bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-linear-to-br from-muted to-muted/50">
              <span className="text-sm">No Image</span>
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/65 via-black/10 to-transparent opacity-90" />
          {featured && (
            <Badge className="absolute top-3 right-3 bg-background/80 text-foreground border border-border/70 backdrop-blur shadow-sm">
              Featured
            </Badge>
          )}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <Badge className="bg-background/80 backdrop-blur text-foreground border border-border/70 shadow-sm">
              <Tag className="size-3" />
              {category}
            </Badge>
            <Badge variant="secondary" className="bg-background/55 backdrop-blur text-foreground border border-border/60">
              <Building className="size-3" />
              {buildingType}
            </Badge>
          </div>
        </div>

        <CardContent className="relative px-5 pb-5">
          <div className="space-y-3">
            <div className="pt-1">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-medium text-muted-foreground">
                  {location}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {propertyType}
                </p>
              </div>
              <h3 className="mt-2 text-[1.05rem] font-semibold leading-snug tracking-tight line-clamp-2 transition-colors group-hover:text-primary">
                {title}
              </h3>
            </div>

            <div className="flex items-end justify-between gap-3">
              <p className="text-xl font-semibold tracking-tight">
                {formatPrice(price)}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 rounded-xl border bg-background/50 p-2.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <BedDouble className="size-4 text-foreground/70" />
                <span className="font-medium text-foreground">{bedrooms}</span>
                <span>beds</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Ruler className="size-4 text-foreground/70" />
                <span className="font-medium text-foreground">{size}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building className="size-4 text-foreground/70" />
                <span className="font-medium text-foreground line-clamp-1">{buildingType}</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-1 flex items-center gap-1.5">
              <MapPin className="size-4 text-foreground/70" />
              {address}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

