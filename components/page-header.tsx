"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
  children?: ReactNode;
  className?: string;
  image?: string;
  imageAlt?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  children,
  className,
  image,
  imageAlt,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "relative min-h-[60vh] flex items-center py-16 md:py-24 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden",
        className
      )}
    >
      {/* Background image with overlay */}
      {image ? (
        <div className="absolute inset-0">
          <Image
            src={image}
            alt={imageAlt || title}
            fill
            className="object-cover"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-linear-to-br from-background/95 via-background/85 to-background/90" />
          <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent" />
        </div>
      ) : (
        <>
          {/* Gradient background when no image */}
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-background to-accent/5" />
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -left-24 h-[600px] w-[600px] rounded-full bg-primary/8 blur-3xl" />
            <div className="absolute -bottom-32 -right-28 h-[600px] w-[600px] rounded-full bg-accent/12 blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-primary/5 blur-3xl" />
          </div>
        </>
      )}

      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="max-w-4xl">
          {breadcrumb && breadcrumb.length > 0 && (
            <div className="mb-8">
              <Breadcrumb items={breadcrumb} />
            </div>
          )}
          
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/60 backdrop-blur-sm px-4 py-2 text-sm font-medium text-foreground shadow-sm mb-6">
            <Sparkles className="size-4 text-primary" />
            <span>Premium Experience</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.05] mb-6">
            <span className="bg-linear-to-br from-foreground via-foreground to-foreground/80 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          
          {description && (
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mb-8">
              {description}
            </p>
          )}
          
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-background to-transparent pointer-events-none" />
    </div>
  );
}
