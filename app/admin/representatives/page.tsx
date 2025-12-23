"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";

export default function AdminRepresentativesPage() {
  const router = useRouter();
  const { sessionToken, admin } = useAuthStore();
  const currentAdmin = useQuery(
    api.auth.getCurrentAdmin,
    sessionToken ? { sessionToken } : "skip"
  );
  const representatives = useQuery(api.representatives.list);
  const deleteRep = useMutation(api.representatives.remove);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionToken && !admin && !currentAdmin) {
      router.push("/admin/login");
    }
  }, [sessionToken, admin, currentAdmin, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this representative?")) return;
    setDeletingId(id);
    try {
      await deleteRep({ id: id as any });
    } catch (error) {
      alert("Failed to delete representative");
    } finally {
      setDeletingId(null);
    }
  };

  if (!currentAdmin && !admin) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Representatives</h1>
            <p className="text-muted-foreground">Manage estate agents and representatives</p>
          </div>
          <Link href="/admin/representatives/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Representative
            </Button>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Representatives</CardTitle>
          </CardHeader>
          <CardContent>
            {representatives && representatives.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {representatives.map((rep) => (
                      <TableRow key={rep._id}>
                        <TableCell className="font-medium">{rep.name}</TableCell>
                        <TableCell>{rep.role}</TableCell>
                        <TableCell>{rep.phone}</TableCell>
                        <TableCell>{rep.email || "-"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link href={`/admin/representatives/${rep._id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(rep._id)}
                              disabled={deletingId === rep._id}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No representatives found. Add your first representative!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

