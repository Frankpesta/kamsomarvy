"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Link from "next/link";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";

export default function AdminAdminsPage() {
  const router = useRouter();
  const { sessionToken, admin } = useAuthStore();
  const currentAdmin = useQuery(
    api.auth.getCurrentAdmin,
    sessionToken ? { sessionToken } : "skip"
  );
  const admins = useQuery(api.admins.list);
  const inviteAdmin = useMutation(api.admins.invite);
  const deleteAdmin = useMutation(api.admins.remove);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ name: "", email: "", role: "admin" });

  useEffect(() => {
    if (!sessionToken && !admin && !currentAdmin) {
      router.push("/admin/login");
    }
  }, [sessionToken, admin, currentAdmin, router]);

  const isSuperAdmin = currentAdmin?.role === "super_admin" || admin?.role === "super_admin";

  useEffect(() => {
    if (!isSuperAdmin) {
      router.push("/admin");
    }
  }, [isSuperAdmin, router]);

  const handleInvite = async () => {
    try {
      await inviteAdmin(inviteData);
      setIsInviteOpen(false);
      setInviteData({ name: "", email: "", role: "admin" });
      alert("Admin invited successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to invite admin");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this admin?")) return;
    try {
      await deleteAdmin({ id: id as any });
    } catch (error) {
      alert("Failed to delete admin");
    }
  };

  if (!currentAdmin && !admin) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Management</h1>
            <p className="text-muted-foreground">Manage admin accounts and permissions</p>
          </div>
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Invite Admin
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite New Admin</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={inviteData.name}
                      onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                      placeholder="Admin name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={inviteData.email}
                      onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={inviteData.role}
                      onValueChange={(value) => setInviteData({ ...inviteData, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleInvite} className="w-full">
                    Invite Admin
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Admins</CardTitle>
          </CardHeader>
          <CardContent>
            {admins && admins.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((adminItem) => (
                      <TableRow key={adminItem._id}>
                        <TableCell className="font-medium">{adminItem.name}</TableCell>
                        <TableCell>{adminItem.email}</TableCell>
                        <TableCell>
                          <Badge variant={adminItem.role === "super_admin" ? "default" : "secondary"}>
                            {adminItem.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(adminItem.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {adminItem._id !== (currentAdmin?._id || admin?._id) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(adminItem._id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No admins found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

