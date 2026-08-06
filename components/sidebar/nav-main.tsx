"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CirclePlusIcon } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface NavigationItem {
  title: string;
  url: string;
  icon?: React.ReactNode;
}

interface NavMainProps {
  items: NavigationItem[];
}

export function NavMain({
  items,
}: NavMainProps) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* Quick Create */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Quick Create"
              render={<Link href="/admin/courses/create" />}
              isActive={pathname.startsWith(
                "/admin/courses/create",
              )}
              className="h-12 min-w-8 rounded-lg bg-primary px-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90"
            >
              <CirclePlusIcon className="size-5" />

              <span>Quick Create</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Navigation links */}
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              item.url === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.url);

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  render={<Link href={item.url} />}
                  isActive={isActive}
                  className="h-11 rounded-lg px-4 text-base"
                >
                  {item.icon}

                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}