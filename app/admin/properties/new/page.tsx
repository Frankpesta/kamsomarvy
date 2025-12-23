"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useConvex } from "convex/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { uploadFiles } from "@/lib/file-upload";
import { AdminLayout } from "@/components/admin/admin-layout";
import { FileWithPreview, FileUpload } from "@/components/ui/file-upload";

const propertySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  price: z.number().min(0, "Price must be positive"),
  location: z.string().min(3, "Location is required"),
  address: z.string().min(5, "Address is required"),
  size: z.string().min(1, "Size is required"),
  bedrooms: z.number().min(0),
  propertyType: z.string(),
  category: z.string(),
  buildingType: z.string(),
  features: z.string(), // Comma-separated
  description: z.string().optional(),
  featured: z.boolean(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

export default function NewPropertyPage() {
  const router = useRouter();
  const convex = useConvex();
  const createProperty = useMutation(api.properties.create);
  const [images, setImages] = useState<FileWithPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      featured: false,
      bedrooms: 0,
      price: 0,
    },
  });

  const onSubmit = async (data: PropertyFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Upload images
      let imageIds: Id<"_storage">[] = [];
      if (images.length > 0) {
        imageIds = await uploadFiles(convex, images);
      }

      // Parse features
      const featuresArray = data.features
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      await createProperty({
        ...data,
        features: featuresArray,
        images: imageIds,
      });

      router.push("/admin/properties");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create property");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/properties">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Add New Property</h1>
            <p className="text-muted-foreground">Create a new property listing</p>
          </div>
        </div>
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}

              <FileUpload
                files={images}
                onFilesChange={setImages}
                accept="image/*"
                multiple={true}
                maxFiles={20}
                maxSizeMB={10}
                label="Property Images"
                description="Upload high-quality images of the property. You can select multiple images at once."
              />

              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register("title")} placeholder="Property title" />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (₦)</Label>
                  <Input
                    id="price"
                    type="number"
                    {...register("price", { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    {...register("bedrooms", { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.bedrooms && (
                    <p className="text-sm text-destructive mt-1">{errors.bedrooms.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...register("location")} placeholder="Area/Location" />
                {errors.location && (
                  <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address">Full Address</Label>
                <Textarea
                  id="address"
                  {...register("address")}
                  placeholder="Complete address"
                  rows={2}
                />
                {errors.address && (
                  <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="size">Size</Label>
                <Input id="size" {...register("size")} placeholder="e.g., 350 sqm" />
                {errors.size && (
                  <p className="text-sm text-destructive mt-1">{errors.size.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    onValueChange={(value) => setValue("category", value)}
                    {...register("category")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="For Sale">For Sale</SelectItem>
                      <SelectItem value="For Rent">For Rent</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select
                    onValueChange={(value) => setValue("propertyType", value)}
                    {...register("propertyType")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Land">Land</SelectItem>
                      <SelectItem value="Carcass">Carcass</SelectItem>
                      <SelectItem value="Pre-Finish">Pre-Finish</SelectItem>
                      <SelectItem value="Finished">Finished</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.propertyType && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.propertyType.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="buildingType">Building Type</Label>
                <Input
                  id="buildingType"
                  {...register("buildingType")}
                  placeholder="e.g., Terrace, Duplex, Penthouse"
                />
                {errors.buildingType && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.buildingType.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="features">Features (comma-separated)</Label>
                <Textarea
                  id="features"
                  {...register("features")}
                  placeholder="e.g., Swimming Pool, Gym, Parking, Security"
                  rows={3}
                />
                {errors.features && (
                  <p className="text-sm text-destructive mt-1">{errors.features.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Detailed description of the property"
                  rows={5}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  {...register("featured")}
                  className="h-4 w-4"
                />
                <Label htmlFor="featured">Feature this property (Hot Sales)</Label>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Creating..." : "Create Property"}
                </Button>
                <Link href="/admin/properties">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

