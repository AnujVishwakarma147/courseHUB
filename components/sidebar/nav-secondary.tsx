"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

interface SecondaryNavigationItem {
  title: string;
  url: string;
  icon: React.ReactNode;
}

interface NavSecondaryProps
  extends React.ComponentPropsWithoutRef<
    typeof SidebarGroup
  > {
  items: SecondaryNavigationItem[];
}

export function NavSecondary({
  items,
  ...props
}: NavSecondaryProps) {
  const pathname = usePathname();

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                render={<Link href={item.url} />}
                isActive={pathname.startsWith(item.url)}
                className="h-11 rounded-lg px-4 text-base"
              >
                {item.icon}

                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}