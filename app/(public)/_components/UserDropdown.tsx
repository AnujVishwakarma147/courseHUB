"use client";

import {
  BookOpenIcon,
  ChevronDownIcon,
  HouseIcon,
  LayoutDashboardIcon,
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
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UserDropdownProps {
    name: string;
    email?: string | null;
    image?: string | null;
}

export function UserDropdown({ email, name, image }: UserDropdownProps) {
  const router = useRouter();

  async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          toast.success("Signed out successfully");
        },
        onError: () => {
          toast.error("Failed to sign out");
        },
      },
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-auto shrink-0 cursor-pointer items-center gap-1 rounded-md p-0 outline-none hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring sm:gap-2">
        <Avatar className="h-9 w-9">
          <AvatarImage src={image ?? undefined} alt={`${name}'s profile`} />
          <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>

        <ChevronDownIcon className="hidden h-4 w-4 text-muted-foreground sm:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="max-w-[calc(100vw-1rem)] w-56"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex min-w-0 flex-col">
            <span className="truncate font-semibold text-foreground">
              {name}
            </span>
            <span className="truncate text-xs font-normal text-muted-foreground">
              {email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/")}>
            <HouseIcon className="mr-2 h-4 w-4" />
            <span>Home</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/courses")}>
            <BookOpenIcon className="mr-2 h-4 w-4" />
            <span>Courses</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard")}>
            <LayoutDashboardIcon className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={signOut}
          className="text-red-500 focus:bg-red-500/10 focus:text-red-500"
        >
          <LogOutIcon className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
