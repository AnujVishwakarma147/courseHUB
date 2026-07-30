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
    <div className="min-h-screen overflow-x-clip lg:min-h-[125vh] lg:[zoom:0.8]">
      <Navbar hasSessionCookie={hasSessionCookie} />

      <main className="w-full px-4 md:px-6 lg:px-10">
        {children}
      </main>
    </div>
  );
}
