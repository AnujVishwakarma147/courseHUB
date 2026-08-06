"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MenuIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";

import Logo from "@/public/logo.png";
import { ThemeToggle } from "@/components/ui/themeToggle";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { UserDropdown } from "./UserDropdown";
import { usePublicSession } from "./PublicSessionGate";

const publicNavigationItems = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Courses",
    href: "/courses",
  },
  {
    name: "About",
    href: "/about",
  },
  {
    name: "Contact Us",
    href: "/contact",
  },
];

const dashboardNavigationItem = {
  name: "Dashboard",
  href: "/dashboard",
};

export function Navbar() {
  const pathname = usePathname();
  const { user } = usePublicSession();

  const navigationItems = user
    ? [
        publicNavigationItems[0],
        publicNavigationItems[1],
        dashboardNavigationItem,
        publicNavigationItems[2],
        publicNavigationItems[3],
      ]
    : publicNavigationItems;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="relative flex min-h-16 w-full items-center px-4 sm:px-5 md:px-6 lg:min-h-20 lg:px-8 xl:px-10">
        {/* Logo and brand */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="overflow-hidden rounded-lg border border-border bg-muted shadow-sm transition-transform duration-200 hover:scale-105">
            <Image
              src={Logo}
              alt="CourseHUB logo"
              className="size-8 object-cover lg:size-9"
              priority
            />
          </div>

          <span className="hidden text-lg font-bold tracking-tight sm:inline lg:text-xl">
            Course
            <span className="text-primary">
              HUB
            </span>
          </span>
        </Link>

        {/* Center navigation */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 lg:flex xl:gap-4">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              aria-current={
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href))
                  ? "page"
                  : undefined
              }
              className="whitespace-nowrap rounded-xl px-3 py-2.5 text-base font-semibold text-muted-foreground transition-all duration-200 hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground xl:px-4"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-4 lg:gap-5">
          {!user ? (
            <div className="hidden lg:block">
              <AdminAction />
            </div>
          ) : null}

          <ThemeToggle />

          {user ? (
            <UserDropdown
              name={user.name}
              email={user.email}
              image={user.image}
            />
          ) : (
            <>
              <div className="hidden sm:block">
                <GuestActions />
              </div>

              <MobileNavigation pathname={pathname} />
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function AdminAction() {
  return (
    <Link
      href="/admin"
      className={buttonVariants({
        variant: "outline",
        className:
          "h-12 w-24 gap-2 rounded-xl border-violet-400/50 bg-linear-to-r from-violet-600 to-indigo-600 px-4 text-base font-semibold text-white shadow-md shadow-violet-950/25 hover:from-violet-500 hover:to-indigo-500 hover:text-white",
      })}
    >
      <ShieldCheckIcon className="size-4" />
      <span>Admin</span>
    </Link>
  );
}

function GuestActions() {
  return (
    <div className="flex items-center gap-3 lg:gap-4">
      <Link
        href="/login"
        className={buttonVariants({
          variant: "secondary",
          className:
            "h-11 rounded-lg px-5 text-sm font-semibold sm:w-24 lg:text-base",
        })}
      >
        Login
      </Link>

      <Link
        href="/signup"
        className={buttonVariants({
          className:
            "h-11 rounded-lg px-5 text-sm font-semibold lg:px-6 lg:text-base",
        })}
      >
        Sign Up
      </Link>
    </div>
  );
}

function MobileNavigation({ pathname }: { pathname: string }) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-11 rounded-xl lg:hidden"
            aria-label="Open navigation menu"
          />
        }
      >
        <MenuIcon className="size-5" />
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[min(22rem,88vw)] gap-0"
      >
        <SheetHeader className="border-b px-6 py-5">
          <SheetTitle className="text-xl font-bold tracking-tight">
            Course<span className="text-primary">HUB</span>
          </SheetTitle>
          <SheetDescription className="sr-only">
            CourseHUB navigation and account links
          </SheetDescription>
        </SheetHeader>

        <nav className="flex flex-1 flex-col gap-2 p-4" aria-label="Mobile navigation">
          {publicNavigationItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <SheetClose
                key={item.name}
                render={
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className="rounded-xl px-4 py-3 text-base font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-primary/10 aria-[current=page]:text-primary"
                  />
                }
              >
                {item.name}
              </SheetClose>
            );
          })}
        </nav>

        <SheetFooter className="border-t p-4">
          <SheetClose
            render={
              <Link
                href="/admin"
                className={buttonVariants({ variant: "outline", className: "h-11 w-full" })}
              />
            }
          >
            <ShieldCheckIcon className="size-4" />
            Admin login
          </SheetClose>

          <div className="grid grid-cols-2 gap-2">
            <SheetClose
              render={
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "secondary", className: "h-11" })}
                />
              }
            >
              Login
            </SheetClose>

            <SheetClose
              render={
                <Link
                  href="/signup"
                  className={buttonVariants({ className: "h-11" })}
                />
              }
            >
              Sign Up
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
