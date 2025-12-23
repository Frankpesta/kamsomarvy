"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { AdminLayout } from "@/components/admin/admin-layout";

const contentKeys = [
  { key: "hero_title", label: "Hero Title", type: "text" },
  { key: "hero_subtitle", label: "Hero Subtitle", type: "textarea" },
  { key: "hot_sales_text", label: "Hot Sales Section Title", type: "text" },
  { key: "about_content", label: "About Page Content", type: "textarea" },
];

export default function AdminContentPage() {
  const router = useRouter();
  const { sessionToken, admin } = useAuthStore();
  const currentAdmin = useQuery(
    api.auth.getCurrentAdmin,
    sessionToken ? { sessionToken } : "skip"
  );
  const siteContent = useQuery(api.siteContent.getAll);
  const setContent = useMutation(api.siteContent.set);
  const [content, setContentState] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!sessionToken && !admin && !currentAdmin) {
      router.push("/admin/login");
    }
  }, [sessionToken, admin, currentAdmin, router]);

  useEffect(() => {
    if (siteContent) {
      setContentState(siteContent);
    }
  }, [siteContent]);

  const handleSave = async (key: string, value: string) => {
    if (!currentAdmin && !admin) return;
    setIsSaving(true);
    try {
      await setContent({
        key,
        value,
        updatedBy: (currentAdmin?._id || admin?._id) as any,
      });
      alert("Content saved successfully!");
    } catch (error) {
      alert("Failed to save content");
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentAdmin && !admin) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Site Content</h1>
          <p className="text-muted-foreground">Edit website content and messaging</p>
        </div>
        <div className="max-w-3xl mx-auto space-y-6">
          {contentKeys.map((item) => (
            <Card key={item.key}>
              <CardHeader>
                <CardTitle>{item.label}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.type === "text" ? (
                  <Input
                    value={content[item.key] || ""}
                    onChange={(e) =>
                      setContentState({ ...content, [item.key]: e.target.value })
                    }
                    placeholder={`Enter ${item.label.toLowerCase()}`}
                  />
                ) : (
                  <Textarea
                    value={content[item.key] || ""}
                    onChange={(e) =>
                      setContentState({ ...content, [item.key]: e.target.value })
                    }
                    placeholder={`Enter ${item.label.toLowerCase()}`}
                    rows={5}
                  />
                )}
                <Button
                  onClick={() => handleSave(item.key, content[item.key] || "")}
                  disabled={isSaving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}

