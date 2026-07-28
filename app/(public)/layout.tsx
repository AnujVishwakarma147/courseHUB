import type { ReactNode } from "react";

import { Navbar } from "./_components/Navbar";

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({
  children,
}: PublicLayoutProps) {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 md:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}