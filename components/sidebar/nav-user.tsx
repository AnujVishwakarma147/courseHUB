"use client";

import {
  EllipsisVerticalIcon,
  LoaderCircleIcon,
  LogOutIcon,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  adminAuthClient,
  authClient,
} from "@/lib/auth-client";
import { useSignOut } from "@/hooks/use-singout";

type NavUserProps = {
  authMode?: "user" | "admin";
  initialUser?: NavigationUser | null;
};

export type NavigationUser = {
  name?: string | null;
  email: string;
  image?: string | null;
};

export function NavUser({
  authMode = "user",
  initialUser = null,
}: NavUserProps) {
  const { isMobile } = useSidebar();
  const activeAuthClient = authMode === "admin"
    ? adminAuthClient
    : authClient;

  const {
    data: session,
    isPending,
  } = activeAuthClient.useSession();

  const handleSignOut = useSignOut(authMode);
  const user = session?.user ?? initialUser;

  /*
   * Session loading के दौरान profile area गायब नहीं होगा।
   * इससे layout jump और black flash कम होगा।
   */
  if (isPending && !user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            disabled
            className="h-16 rounded-xl border border-sidebar-border bg-sidebar-accent/40 px-3"
          >
            <Avatar className="size-10 rounded-full border border-sidebar-border">
              <AvatarFallback className="rounded-full bg-primary/10 text-primary">
                <LoaderCircleIcon className="size-5 animate-spin" />
              </AvatarFallback>
            </Avatar>

            <div className="grid flex-1 gap-1 text-left">
              <span className="h-3.5 w-28 animate-pulse rounded bg-primary/15" />
              <span className="h-3 w-36 animate-pulse rounded bg-primary/10" />
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!user) {
    return null;
  }

  const displayName =
    user.name?.trim() ||
    user.email.split("@")[0];

  const fallback =
    displayName.charAt(0).toUpperCase() || "U";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="h-16 rounded-xl border border-transparent px-3 transition-colors hover:border-sidebar-border hover:bg-sidebar-accent aria-expanded:border-sidebar-border aria-expanded:bg-sidebar-accent"
              />
            }
          >
            <Avatar className="size-10 rounded-full border border-sidebar-border bg-background shadow-sm">
              <AvatarImage
                src={user.image ?? undefined}
                alt={displayName}
                loading="eager"
              />

              <AvatarFallback className="rounded-full bg-primary/15 font-semibold text-primary">
                {fallback}
              </AvatarFallback>
            </Avatar>

            <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">
                {displayName}
              </span>

              <span className="mt-1 truncate text-xs text-muted-foreground">
                {user.email}
              </span>
            </div>

            <EllipsisVerticalIcon className="ml-auto size-4 text-muted-foreground" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side={isMobile ? "bottom" : "top"}
            align="start"
            sideOffset={10}
            className="w-67.5 rounded-xl p-2 shadow-xl"
          >
            {/* User information */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-3 rounded-lg px-2 py-2.5">
                  <Avatar className="size-11 rounded-full border">
                    <AvatarImage
                      src={user.image ?? undefined}
                      alt={displayName}
                    />

                    <AvatarFallback className="rounded-full bg-primary/15 font-semibold text-primary">
                      {fallback}
                    </AvatarFallback>
                  </Avatar>

                  <div className="grid min-w-0 flex-1 text-left">
                    <span className="truncate text-sm font-semibold">
                      {displayName}
                    </span>

                    <span className="mt-1 truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Logout */}
            <DropdownMenuItem
              onClick={handleSignOut}
              className="h-10 cursor-pointer rounded-lg text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOutIcon className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
