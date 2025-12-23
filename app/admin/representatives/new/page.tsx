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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { uploadFile } from "@/lib/file-upload";
import { AdminLayout } from "@/components/admin/admin-layout";
import { FileUpload, type FileWithPreview } from "@/components/ui/file-upload";

const representativeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.string().min(2, "Role is required"),
  phone: z.string().min(10, "Phone number is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  order: z.number().min(0),
});

type RepresentativeFormValues = z.infer<typeof representativeSchema>;

export default function NewRepresentativePage() {
  const router = useRouter();
  const convex = useConvex();
  const createRep = useMutation(api.representatives.create);
  const [photo, setPhoto] = useState<FileWithPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RepresentativeFormValues>({
    resolver: zodResolver(representativeSchema),
    defaultValues: {
      order: 0,
    },
  });

  const onSubmit = async (data: RepresentativeFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      let photoId: Id<"_storage"> | undefined = undefined;
      if (photo.length > 0) {
        photoId = await uploadFile(convex, photo[0]);
      }

      await createRep({
        ...data,
        email: data.email || undefined,
        photo: photoId,
      });

      router.push("/admin/representatives");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create representative");
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
            <h1 className="text-3xl font-bold">Add New Representative</h1>
            <p className="text-muted-foreground">Create a new representative profile</p>
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

              <FileUpload
                files={photo}
                onFilesChange={setPhoto}
                accept="image/*"
                multiple={false}
                maxFiles={1}
                maxSizeMB={5}
                label="Photo (Optional)"
                description="Upload a profile photo for this representative"
              />

              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} placeholder="Full name" />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Input id="role" {...register("role")} placeholder="e.g., Sales Executive" />
                {errors.role && (
                  <p className="text-sm text-destructive mt-1">{errors.role.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} placeholder="+234 000 000 0000" />
                {errors.phone && (
                  <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="email@example.com"
                />
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
                  placeholder="0"
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
                  {isSubmitting ? "Creating..." : "Create Representative"}
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

