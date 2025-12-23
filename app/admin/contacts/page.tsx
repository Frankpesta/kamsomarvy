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
} from "@/components/ui/dialog";
import {
  Mail,
  Phone,
  User,
  MessageSquare,
  Check,
  X,
  Trash2,
  Eye,
  Clock,
} from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
// Simple date formatter
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function ContactsPage() {
  const router = useRouter();
  const { sessionToken, admin } = useAuthStore();
  const currentAdmin = useQuery(
    api.auth.getCurrentAdmin,
    sessionToken ? { sessionToken } : "skip"
  );
  const submissions = useQuery(api.contact.list, {});
  const markAsRead = useMutation(api.contact.markAsRead);
  const markAsReplied = useMutation(api.contact.markAsReplied);
  const removeSubmission = useMutation(api.contact.remove);

  const [selectedSubmission, setSelectedSubmission] = useState<Id<"contactSubmissions"> | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sessionToken && !admin && !currentAdmin) {
      router.push("/admin/login");
    }
  }, [sessionToken, admin, currentAdmin, router]);

  if (!currentAdmin && !admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const unreadCount = submissions?.filter((s) => !s.read).length || 0;

  const handleView = (id: Id<"contactSubmissions">) => {
    setSelectedSubmission(id);
    setIsDialogOpen(true);
    const submission = submissions?.find((s) => s._id === id);
    if (submission && !submission.read) {
      markAsRead({ id });
    }
  };

  const handleMarkAsReplied = async (id: Id<"contactSubmissions">) => {
    await markAsReplied({ id });
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: Id<"contactSubmissions">) => {
    if (confirm("Are you sure you want to delete this submission?")) {
      await removeSubmission({ id });
      if (selectedSubmission === id) {
        setIsDialogOpen(false);
      }
    }
  };

  const selectedSubmissionData = submissions?.find(
    (s) => s._id === selectedSubmission
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div ref={headerRef} className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Contact Submissions</h1>
            <p className="text-muted-foreground mt-1">
              Manage and respond to customer inquiries
            </p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="default" className="text-sm px-3 py-1.5 text-base">
              {unreadCount} unread
            </Badge>
          )}
        </div>

        {/* Stats */}
        {submissions && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="size-4 text-primary" />
                  Total Messages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{submissions.length}</div>
                <p className="text-xs text-muted-foreground mt-1">All submissions</p>
              </CardContent>
            </Card>
            <Card className="stat-card border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="size-4 text-amber-600 dark:text-amber-400" />
                  Unread
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{unreadCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
              </CardContent>
            </Card>
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Check className="size-4 text-green-600 dark:text-green-400" />
                  Replied
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {submissions.filter((s) => s.replied).length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Already responded</p>
              </CardContent>
            </Card>
          </div>
        )}

        {submissions && submissions.length > 0 ? (
          <Card ref={tableRef} className="border-2">
            <CardHeader>
              <CardTitle>All Submissions</CardTitle>
              <CardDescription>
                Click on any submission to view full details and respond
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow
                      key={submission._id}
                      className={!submission.read ? "bg-muted/50" : ""}
                    >
                      <TableCell className="font-medium">
                        {submission.name}
                      </TableCell>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell>{submission.phone}</TableCell>
                      <TableCell>
                        {formatDate(submission.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!submission.read && (
                            <Badge variant="default" className="text-xs">
                              New
                            </Badge>
                          )}
                          {submission.replied && (
                            <Badge variant="secondary" className="text-xs">
                              Replied
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(submission._id)}
                          >
                            <Eye className="size-4" />
                          </Button>
                          {!submission.replied && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsReplied(submission._id)}
                            >
                              <Check className="size-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(submission._id)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No contact submissions yet.
            </CardContent>
          </Card>
        )}

        {/* Submission Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            {selectedSubmissionData && (
              <>
                <DialogHeader>
                  <DialogTitle>Contact Submission Details</DialogTitle>
                  <DialogDescription>
                    Submitted on {formatDateTime(selectedSubmissionData.createdAt)}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/50">
                      <User className="size-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{selectedSubmissionData.name}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/50">
                      <Mail className="size-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <a
                          href={`mailto:${selectedSubmissionData.email}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {selectedSubmissionData.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/50">
                      <Phone className="size-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <a
                          href={`tel:${selectedSubmissionData.phone}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {selectedSubmissionData.phone}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 rounded-lg border bg-muted/50">
                      <Clock className="size-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <div className="flex items-center gap-2 mt-1">
                          {!selectedSubmissionData.read && (
                            <Badge variant="default" className="text-xs">
                              New
                            </Badge>
                          )}
                          {selectedSubmissionData.replied && (
                            <Badge variant="secondary" className="text-xs">
                              Replied
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-start gap-3 mb-3">
                      <MessageSquare className="size-5 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground font-medium">
                        Message
                      </p>
                    </div>
                    <p className="text-foreground whitespace-pre-line leading-relaxed">
                      {selectedSubmissionData.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-4 border-t">
                    <a
                      href={`mailto:${selectedSubmissionData.email}?subject=Re: Your inquiry from Kamsomarvy`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="gap-2">
                        <Mail className="size-4" />
                        Reply via Email
                      </Button>
                    </a>
                    {!selectedSubmissionData.replied && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleMarkAsReplied(selectedSubmissionData._id)
                        }
                        className="gap-2"
                      >
                        <Check className="size-4" />
                        Mark as Replied
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => handleDelete(selectedSubmissionData._id)}
                      className="gap-2 text-destructive"
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

