"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { usePublicSession } from "./PublicSessionGate";

export function SessionAwareSignInLink() {
  const { user } = usePublicSession();

  if (user) {
    return null;
  }

  return (
    <Link
      className={buttonVariants({
        size: "lg",
        variant: "outline",
        className: "h-12 rounded-xl px-6 text-base",
      })}
      href="/login"
    >
      Sign in
    </Link>
  );
}
