import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuthLayoutProps = {
  children: ReactNode;
};

export default function AuthLayout({
  children,
}: AuthLayoutProps) {
  return (
    <div className="relative min-h-svh overflow-x-hidden bg-background px-4 py-4 md:px-6">
      <Link
        href="/"
        className={cn(
          buttonVariants({
            variant: "outline",
            size: "sm",
          }),
          "absolute left-4 top-4 z-20 h-9 gap-2 rounded-lg md:left-6",
        )}
      >
        <ArrowLeftIcon className="size-4" />
        Back
      </Link>

      <div className="mx-auto flex min-h-[calc(100svh-2rem)] w-full max-w-5xl items-center justify-center pt-12 md:pt-10">
        {children}
      </div>
    </div>
  );
}