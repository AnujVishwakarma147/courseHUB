"use client"

import * as React from "react"

import { NavMain } from "@/components/sidebar/nav-main"
import { NavSecondary } from "@/components/sidebar/nav-secondary"
import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { LayoutDashboardIcon, BookOpenIcon, ChartBarIcon, FolderIcon, UsersIcon, Settings2Icon, CircleHelpIcon, SearchIcon, BookMarkedIcon } from "lucide-react"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: (
        <LayoutDashboardIcon
        />
      ),
    },
    {
      title: "Courses",
      url: "/admin/courses",
      icon: (
        <BookOpenIcon
        />
      ),
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: (
        <ChartBarIcon
        />
      ),
    },
    {
      title: "Projects",
      url: "/admin/projects",
      icon: (
        <FolderIcon
        />
      ),
    },
    {
      title: "Team",
      url: "/admin/team",
      icon: (
        <UsersIcon
        />
      ),
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
    },
    {
      title: "Get Help",
      url: "#",
      icon: (
        <CircleHelpIcon
        />
      ),
    },
    {
      title: "Search",
      url: "#",
      icon: (
        <SearchIcon
        />
      ),
    },
  ],
}
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
    >
      <SidebarHeader className="px-5 pb-3 pt-5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-12 gap-3 rounded-none px-2 text-sidebar-foreground hover:bg-transparent"
              render={<a href="#" />}
            >
              <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <BookMarkedIcon className="size-4!" />
              </span>
              <span className="text-xl font-semibold tracking-tight">CourseHub.</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
