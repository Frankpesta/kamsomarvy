"use client";

import { useState, use } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvex } from "convex/react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { uploadFile } from "@/lib/file-upload";
import { AdminLayout } from "@/components/admin/admin-layout";
import Image from "next/image";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { FileWithPreview, FileUpload } from "@/components/ui/file-upload";

const representativeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().min(2, "Role is required"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  order: z.number().min(0),
});

type RepresentativeFormValues = z.infer<typeof representativeSchema>;

export default function EditRepresentativePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const convex = useConvex();
  const { id } = use(params);
  const repId = id as Id<"representatives">;
  const rep = useQuery(api.representatives.list);
  const currentRep = rep?.find((r) => r._id === repId);
  const updateRep = useMutation(api.representatives.update);
  const [photo, setPhoto] = useState<FileWithPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const photoUrl = useQuery(
    api.files.getUrl,
    currentRep?.photo ? { storageId: currentRep.photo } : "skip"
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RepresentativeFormValues>({
    resolver: zodResolver(representativeSchema),
    values: currentRep
      ? {
          name: currentRep.name,
          role: currentRep.role,
          phone: currentRep.phone,
          email: currentRep.email || "",
          order: currentRep.order,
        }
      : undefined,
  });

  if (!currentRep) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const onSubmit = async (data: RepresentativeFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      let photoId: Id<"_storage"> | undefined = currentRep.photo;
      if (photo.length > 0) {
        photoId = await uploadFile(convex, photo[0]);
      }

      await updateRep({
        id: repId,
        ...data,
        email: data.email || undefined,
        photo: photoId,
      });

      router.push("/admin/representatives");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update representative");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/representatives">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Edit Representative</h1>
            <p className="text-muted-foreground">Update representative details</p>
          </div>
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Representative Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex items-center gap-4">
                {photoUrl && (
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={photoUrl} alt={currentRep.name} />
                    <AvatarFallback>
                      {currentRep.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className="flex-1">
                  <FileUpload
                    files={photo}
                    onFilesChange={setPhoto}
                    accept="image/*"
                    multiple={false}
                    maxFiles={1}
                    maxSizeMB={5}
                    label="Change Photo (Optional)"
                    description="Upload a new profile photo for this representative"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Input id="role" {...register("role")} />
                {errors.role && (
                  <p className="text-sm text-destructive mt-1">{errors.role.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} />
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  {...register("order", { valueAsNumber: true })}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Lower numbers appear first
                </p>
                {errors.order && (
                  <p className="text-sm text-destructive mt-1">{errors.order.message}</p>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? "Updating..." : "Update Representative"}
                </Button>
                <Link href="/admin/representatives">
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

