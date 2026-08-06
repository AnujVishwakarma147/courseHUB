"use client";

import {
  BookOpenIcon,
  ChevronDownIcon,
  HouseIcon,
  InfoIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MailIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
import { useSignOut } from "@/hooks/use-singout";

interface UserDropdownProps {
  name: string;
  email?: string | null;
  image?: string | null;
}

export function UserDropdown({
  email,
  name,
  image,
}: UserDropdownProps) {
  const router = useRouter();
  const signOut = useSignOut();

  const firstLetter = name?.trim().charAt(0).toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl p-1 outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring sm:gap-2"
        aria-label="Open profile menu"
      >
        <Avatar className="size-11 border border-border bg-secondary shadow-sm lg:size-12">
          <AvatarImage
            src={image ?? undefined}
            alt={`${name}'s profile`}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            referrerPolicy="no-referrer"
          />

          <AvatarFallback className="bg-primary/15 text-base font-bold text-primary lg:text-lg">
            {firstLetter}
          </AvatarFallback>
        </Avatar>

        <ChevronDownIcon className="hidden size-5 text-muted-foreground sm:block lg:size-6" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 max-w-[calc(100vw-1rem)]"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex min-w-0 flex-col gap-1 px-3 py-2">
            <span className="truncate text-base font-semibold text-foreground">
              {name}
            </span>

            {email ? (
              <span className="truncate text-sm font-normal text-muted-foreground">
                {email}
              </span>
            ) : null}
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer py-2.5 text-base"
            onClick={() => router.push("/")}
          >
            <HouseIcon className="mr-2 size-5" />
            <span>Home</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer py-2.5 text-base"
            onClick={() => router.push("/courses")}
          >
            <BookOpenIcon className="mr-2 size-5" />
            <span>Courses</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer py-2.5 text-base"
            onClick={() => router.push("/dashboard")}
          >
            <LayoutDashboardIcon className="mr-2 size-5" />
            <span>Dashboard</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer py-2.5 text-base"
            onClick={() => router.push("/about")}
          >
            <InfoIcon className="mr-2 size-5" />
            <span>About</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="cursor-pointer py-2.5 text-base"
            onClick={() => router.push("/contact")}
          >
            <MailIcon className="mr-2 size-5" />
            <span>Contact Us</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={signOut}
          className="cursor-pointer py-2.5 text-base text-red-500 focus:bg-red-500/10 focus:text-red-500"
        >
          <LogOutIcon className="mr-2 size-5" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
