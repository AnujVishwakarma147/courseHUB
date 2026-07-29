import type { ReactNode } from "react";
import { getSessionCookie } from "better-auth/cookies";
import { headers } from "next/headers";

import { Navbar } from "./_components/Navbar";

type PublicLayoutProps = {
  children: ReactNode;
};

export default async function PublicLayout({
  children,
}: PublicLayoutProps) {
  const hasSessionCookie = Boolean(getSessionCookie(await headers()));

  return (
    <div className="min-h-screen">
      <Navbar hasSessionCookie={hasSessionCookie} />

      <main className="container mx-auto px-4 md:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
