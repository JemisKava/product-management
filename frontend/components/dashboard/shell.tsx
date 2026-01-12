"use client";

import type { ReactNode } from "react";
import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

type DashboardShellProps = {
  title: string;
  children: ReactNode;
};

export function DashboardShell({ title, children }: DashboardShellProps) {
  return (
    <SidebarProvider className="bg-sidebar">
      <DashboardSidebar />
      <div className="h-svh overflow-hidden lg:p-2 w-full">
        <div className="lg:border lg:rounded-md overflow-hidden flex flex-col items-center justify-start bg-container h-full w-full bg-background">
          <DashboardHeader title={title} />
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
}
