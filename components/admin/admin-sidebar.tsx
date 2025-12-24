"use client";

import * as React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  Settings,
  UserCog,
  LayoutDashboard,
  Home,
  LogOut,
  Mail,
  MailCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Properties",
    url: "/admin/properties",
    icon: Home,
  },
  {
    title: "Representatives",
    url: "/admin/representatives",
    icon: Users,
  },
  {
    title: "Site Content",
    url: "/admin/content",
    icon: Settings,
  },
  {
    title: "Contact Submissions",
    url: "/admin/contacts",
    icon: Mail,
  },
  {
    title: "Newsletter Subscribers",
    url: "/admin/newsletter",
    icon: MailCheck,
  },
];

const adminMenuItems = [
  {
    title: "Admin Management",
    url: "/admin/admins",
    icon: UserCog,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { sessionToken, admin, clearSession } = useAuthStore();
  const currentAdmin = useQuery(
    api.auth.getCurrentAdmin,
    sessionToken ? { sessionToken } : "skip"
  );

  // Type guard to safely extract admin properties
  const getAdminProperty = <T,>(adminData: unknown, property: string): T | null => {
    if (adminData && typeof adminData === "object" && property in adminData) {
      return (adminData as Record<string, T>)[property];
    }
    return null;
  };

  const currentAdminRole = getAdminProperty<string>(currentAdmin, "role");
  const currentAdminName = getAdminProperty<string>(currentAdmin, "name");
  const adminRole = getAdminProperty<string>(admin, "role");
  const adminName = getAdminProperty<string>(admin, "name");

  const isSuperAdmin = currentAdminRole === "super_admin" || adminRole === "super_admin";
  const displayName = currentAdminName || adminName || "Admin";

  const handleLogout = () => {
    clearSession();
    window.location.href = "/admin/login";
  };

  return (
    <Sidebar collapsible="none">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="relative h-8 w-8 rounded-lg overflow-hidden shrink-0">
            <Image
              src="/kamsologo.png"
              alt="Kamsomarvy"
              width={300}
              height={300}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 overflow-y-auto flex-1">
        <SidebarGroup className="space-y-2">
          <SidebarGroupLabel className="px-2 mb-2">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.url || pathname?.startsWith(item.url + "/");
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive} className="w-full">
                      <Link href={item.url}>
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isSuperAdmin && (
          <SidebarGroup className="mt-6 space-y-2">
            <SidebarGroupLabel className="px-2 mb-2">Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1">
                {adminMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.url || pathname?.startsWith(item.url + "/");
                  return (
                    <SidebarMenuItem key={item.url}>
                      <SidebarMenuButton asChild isActive={isActive} className="w-full">
                        <Link href={item.url}>
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {displayName
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-sm font-medium truncate w-full">{displayName}</span>
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {currentAdminRole || adminRole || "Admin"}
                    </span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    View Site
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

