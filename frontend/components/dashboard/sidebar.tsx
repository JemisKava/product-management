"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { useAuthStore } from "@/store/authStore";
import {
  Atom,
  ChevronsUpDown,
  LogOut,
  Package,
  Shield,
  Users,
} from "lucide-react";

type NavItem = {
  title: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarSeed(value?: string) {
  return encodeURIComponent(value?.trim() || "user");
}

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    user,
    logout: logoutStore,
    getUserRoleFromToken,
    hasPermission,
  } = useAuthStore();

  const userRole = getUserRoleFromToken() || user?.role;
  const isAdmin = userRole === "ADMIN";
  const canViewProducts = isAdmin || hasPermission("PRODUCT_VIEW");

  const navItems: NavItem[] = [
    ...(canViewProducts
      ? [{ title: "Products", href: "/products", icon: Package }]
      : []),
    ...(isAdmin
      ? [
          { title: "Users", href: "/users", icon: Users },
          { title: "Permissions", href: "/permissions", icon: Shield },
        ]
      : []),
  ];

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Logged out successfully", {
        description: "You have been signed out of your account.",
      });
      logoutStore();
      router.push("/");
    },
    onError: () => {
      toast.info("Logged out", {
        description: "You have been signed out.",
      });
      logoutStore();
      router.push("/");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Sidebar collapsible="offcanvas" className="lg:border-r-0!" {...props}>
      <SidebarHeader className="p-3 sm:p-4 lg:p-5 pb-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-5 items-center justify-center rounded bg-linear-to-b from-[#6e3ff3] to-[#aa8ef9] text-white">
            <Atom className="size-3" />
          </div>
          <span className="font-semibold text-base sm:text-lg">Apex</span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 sm:px-4 lg:px-5">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="px-0 text-[10px] sm:text-[11px] font-semibold tracking-wider text-muted-foreground">
            NAVIGATION
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="mt-2">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    className="h-9 sm:h-[38px]"
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4 sm:size-5" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="px-3 sm:px-4 lg:px-5 pb-3 sm:pb-4 lg:pb-5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-2 sm:gap-3 rounded-lg border bg-card p-2 sm:p-3 cursor-pointer hover:bg-accent transition-colors">
              <Avatar className="size-7 sm:size-8">
                <AvatarImage
                  src={`https://api.dicebear.com/9.x/glass/svg?seed=${getAvatarSeed(
                    user?.email || user?.name
                  )}`}
                />
                <AvatarFallback className="text-xs">
                  {getInitials(user?.name || "User")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs sm:text-sm truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                  {user?.email || "user@company.com"}
                </p>
              </div>
              <ChevronsUpDown className="size-4 text-muted-foreground shrink-0" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem
              className="text-destructive"
              onSelect={handleLogout}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="size-4 mr-2" />
              {logoutMutation.isPending ? "Logging out..." : "Log out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
