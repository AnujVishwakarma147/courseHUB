"use client";

import * as React from "react";
import Link from "next/link";
import {
  BookMarkedIcon,
  BookOpenIcon,
  FolderKanbanIcon,
  GraduationCapIcon,
  LayoutDashboardIcon,
  SearchIcon,
  UsersIcon,
} from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import {
  NavUser,
  type NavigationUser,
} from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Courses",
      url: "/admin/courses",
      icon: <BookOpenIcon />,
    },
    {
      title: "Projects",
      url: "/admin/projects",
      icon: <FolderKanbanIcon />,
    },
    {
      title: "Team",
      url: "/admin/team",
      icon: <UsersIcon />,
    },
    {
      title: "Students",
      url: "/admin/students",
      icon: <GraduationCapIcon />,
    },
    {
      title: "Search",
      url: "/admin/search",
      icon: <SearchIcon />,
    },
  ],
};

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  initialUser: NavigationUser;
};

export function AppSidebar({
  initialUser,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
    >
      {/* Logo */}
      <SidebarHeader className="px-5 pb-3 pt-5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/admin" />}
              className="h-12 gap-3 rounded-lg px-2 text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <BookMarkedIcon className="size-5" />
              </span>

              <span className="text-xl font-semibold tracking-tight">
                CourseHub.
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser authMode="admin" initialUser={initialUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
