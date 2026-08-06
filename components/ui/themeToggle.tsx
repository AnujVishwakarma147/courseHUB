"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Change theme"
            className="relative size-11 rounded-xl shadow-sm lg:size-12"
          >
            <SunIcon className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 lg:size-6" />

            <MoonIcon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 lg:size-6" />

            <span className="sr-only">Change theme</span>
          </Button>
        }
      />

      <DropdownMenuContent
        align="end"
        className="w-40"
      >
        <DropdownMenuItem
          className="text-base"
          onClick={() => setTheme("light")}
        >
          <SunIcon className="mr-2 size-4" />
          Light
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-base"
          onClick={() => setTheme("dark")}
        >
          <MoonIcon className="mr-2 size-4" />
          Dark
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-base"
          onClick={() => setTheme("system")}
        >
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}