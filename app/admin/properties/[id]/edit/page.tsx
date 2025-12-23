"use client";

import { useState, useEffect, use } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvex } from "convex/react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
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
import Image from "next/image";
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
  features: z.string(),
  description: z.string().optional(),
  featured: z.boolean(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

export default function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const convex = useConvex();
  const { id } = use(params);
  const propertyId = id as Id<"properties">;
  const property = useQuery(api.properties.get, { id: propertyId });
  const updateProperty = useMutation(api.properties.update);
  const [images, setImages] = useState<FileWithPreview[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imageUrls = useQuery(
    api.files.getUrls,
    property?.images ? { storageIds: property.images } : "skip"
  );

  useEffect(() => {
    if (imageUrls) {
      setExistingImages(imageUrls);
    }
  }, [imageUrls]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(propertySchema),
    values: property
      ? {
          title: property.title,
          price: property.price,
          location: property.location,
          address: property.address,
          size: property.size,
          bedrooms: property.bedrooms,
          propertyType: property.propertyType,
          category: property.category,
          buildingType: property.buildingType,
          features: property.features.join(", "),
          description: property.description || "",
          featured: property.featured,
        }
      : undefined,
  });

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const onSubmit = async (data: PropertyFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      let imageIds: Id<"_storage">[] = property.images || [];
      if (images.length > 0) {
        const newImageIds = await uploadFiles(convex, images);
        imageIds = [...imageIds, ...newImageIds];
      }

      const featuresArray = data.features
        .split(",")
        .map((f) => f.trim())
        .filter((f) => f.length > 0);

      await updateProperty({
        id: propertyId,
        ...data,
        features: featuresArray,
        images: imageIds,
      });

      router.push("/admin/properties");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update property");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveImage = async (index: number) => {
    if (!property) return;
    const newImages = [...property.images];
    newImages.splice(index, 1);
    try {
      await updateProperty({
        id: propertyId,
        images: newImages,
      });
      // Refresh the page data
      window.location.reload();
    } catch {
      alert("Failed to remove image");
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
            <h1 className="text-3xl font-bold">Edit Property</h1>
            <p className="text-muted-foreground">Update property details</p>
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

              <div>
                <Label>Existing Images</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {existingImages.map((url, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={url}
                        alt={`Image ${index + 1}`}
                        fill
                        className="object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-destructive text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <FileUpload
                files={images}
                onFilesChange={setImages}
                accept="image/*"
                multiple={true}
                maxFiles={20}
                maxSizeMB={10}
                label="Add More Images"
                description="Upload additional images for this property"
              />

              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register("title")} />
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
                  />
                  {errors.bedrooms && (
                    <p className="text-sm text-destructive mt-1">{errors.bedrooms.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...register("location")} />
                {errors.location && (
                  <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="address">Full Address</Label>
                <Textarea id="address" {...register("address")} rows={2} />
                {errors.address && (
                  <p className="text-sm text-destructive mt-1">{errors.address.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="size">Size</Label>
                <Input id="size" {...register("size")} />
                {errors.size && (
                  <p className="text-sm text-destructive mt-1">{errors.size.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={watch("category")}
                    onValueChange={(value) => setValue("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="For Sale">For Sale</SelectItem>
                      <SelectItem value="For Rent">For Rent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select
                    value={watch("propertyType")}
                    onValueChange={(value) => setValue("propertyType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Land">Land</SelectItem>
                      <SelectItem value="Carcass">Carcass</SelectItem>
                      <SelectItem value="Pre-Finish">Pre-Finish</SelectItem>
                      <SelectItem value="Finished">Finished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="buildingType">Building Type</Label>
                <Input id="buildingType" {...register("buildingType")} />
                {errors.buildingType && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.buildingType.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="features">Features (comma-separated)</Label>
                <Textarea id="features" {...register("features")} rows={3} />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register("description")} rows={5} />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  {...register("featured")}
                  className="h-4 w-4"
                />
                <Label htmlFor="featured">Feature this property</Label>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Updating..." : "Update Property"}
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

