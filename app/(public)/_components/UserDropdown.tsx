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

export function UserDropdown({email,name,image}:UserDropdownProps) {
    const router =useRouter();
    async function signOut() {
     await authClient.signOut({
        fetchOptions:{
            onSuccess:()=>{
                router.push("/")
                toast.success("Signed out Successfully")
            },
            onError: ()=>{
                toast.error("Failed to sign out")
            }
        }
     })
  }


  return (
    <DropdownMenu>
      {/* Dropdown Trigger (Avatar & Chevron) */}
      <DropdownMenuTrigger className="flex h-auto cursor-pointer items-center gap-2 rounded-md p-0 outline-none hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="h-9 w-9">
          <AvatarImage src={image ?? undefined} alt="Profile image"/>
          <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
       
        <ChevronDownIcon className="h-4 w-4 text-muted-foreground" />
      </DropdownMenuTrigger>

      {/* Dropdown Content */}
      <DropdownMenuContent align="end" className="w-56">
        {/* User Info Header */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col">
            <span className="font-semibold text-foreground">{name}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {email}
            </span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        {/* Group 1 */}
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
        
        {/* Logout */}
        <DropdownMenuItem onClick={signOut} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
          <LogOutIcon className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
