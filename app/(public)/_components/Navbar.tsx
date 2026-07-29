"use client";

import Image from "next/image";
import Link from "next/link";

import Logo from "@/public/logo.png";
import { authClient } from "@/lib/auth-client";
import { ThemeToggle } from "@/components/ui/themeToggle";
import { UserDropdown } from "./UserDropdown";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/courses" },
  { name: "Dashboard", href: "/dashboard" },
];

interface NavbarProps {
  hasSessionCookie: boolean;
}

export function Navbar({ hasSessionCookie }: NavbarProps) {
  const { data: session, isPending } = authClient.useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex min-h-16 w-full items-center gap-3 px-4 md:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src={Logo}
            alt="MarshalLMS logo"
            className="size-9"
            priority
          />

          <span className="hidden font-bold sm:inline">MarshalLMS.</span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center gap-5 md:flex">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center gap-2 sm:gap-3 md:right-6 lg:right-8">
          <ThemeToggle />

          {isPending ? (
            hasSessionCookie ? (
              <Skeleton className="size-9 rounded-full" />
            ) : (
              <GuestActions />
            )
          ) : session ? (
            <UserDropdown
              email={session.user.email}
              image={session.user.image}
              name={session.user.name}
            />
          ) : (
            <GuestActions />
          )}
        </div>
      </div>
    </header>
  );
}

function GuestActions() {
  return (
    <>
      <Link
        href="/login"
        className={buttonVariants({ variant: "secondary" })}
      >
        Login
      </Link>

      <Link
        href="/login"
        className={buttonVariants({ className: "hidden sm:inline-flex" })}
      >
        Get Started
      </Link>
    </>
  );
}
