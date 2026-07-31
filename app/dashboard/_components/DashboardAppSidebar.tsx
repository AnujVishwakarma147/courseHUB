"use client";

import {
  BookMarkedIcon,
  CircleHelpIcon,
  GaugeIcon,
  SearchIcon,
  Settings2Icon,
} from "lucide-react";
import Link from "next/link";

import { NavSecondary } from "@/components/sidebar/nav-secondary";
import { NavUser } from "@/components/sidebar/nav-user";
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

const secondaryItems = [
  {
    title: "Settings",
    url: "#",
    icon: <Settings2Icon />,
  },
  {
    title: "Get Help",
    url: "#",
    icon: <CircleHelpIcon />,
  },
  {
    title: "Search",
    url: "#",
    icon: <SearchIcon />,
  },
];

export function DashboardAppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="px-5 pb-3 pt-5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-12 gap-3 rounded-none px-2 text-sidebar-foreground hover:bg-transparent"
              render={<Link href="/" />}
            >
              <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <BookMarkedIcon className="size-4!" />
              </span>
              <span className="text-xl font-semibold tracking-tight">
                CourseHub.
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive
                  tooltip="Dashboard"
                  render={<Link href="/dashboard" />}
                  className="h-12 rounded-none bg-transparent px-4 text-base font-medium hover:bg-sidebar-accent/40 data-[active=true]:bg-transparent data-[active=true]:hover:bg-sidebar-accent/40"
                >
                  <GaugeIcon className="text-primary" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <NavSecondary
          items={secondaryItems}
          className="mt-auto"
        />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
