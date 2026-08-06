"use client";

import {
  BookMarkedIcon,
  GaugeIcon,
} from "lucide-react";
import Link from "next/link";

import {
  NavUser,
  type NavigationUser,
} from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type DashboardAppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  initialUser: NavigationUser;
};

export function DashboardAppSidebar({
  initialUser,
  ...props
}: DashboardAppSidebarProps) {
  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
    >
      {/* Sidebar logo */}
      <SidebarHeader className="px-4 pb-3 pt-5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/" />}
              className="h-14 gap-3 rounded-xl px-3 text-sidebar-foreground hover:bg-sidebar-accent/50"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <BookMarkedIcon className="size-5" />
              </span>

              <span className="text-xl font-semibold tracking-tight">
                CourseHub.
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main navigation */}
      <SidebarContent className="px-2">
        <SidebarGroup className="p-2">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive
                  tooltip="Dashboard"
                  render={<Link href="/dashboard" />}
                  className="h-12 rounded-xl px-4 text-base font-medium transition-colors hover:bg-sidebar-accent data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                >
                  <GaugeIcon className="size-5 text-primary" />

                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Profile dropdown */}
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <NavUser initialUser={initialUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
