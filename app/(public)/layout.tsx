import type { ReactNode } from "react";

import { LazyCourseAiWidget } from "@/components/ai/LazyCourseAiWidget";
import { Footer } from "./_components/Footer";
import { Navbar } from "./_components/Navbar";
import { PublicSessionGate } from "./_components/PublicSessionGate";

type PublicLayoutProps = {
  children: ReactNode;
};

export default function PublicLayout({
  children,
}: PublicLayoutProps) {
  return (
    <PublicSessionGate>
      <div className="flex min-h-screen flex-col overflow-x-clip">
        <Navbar />

        <main className="w-full flex-1 px-4 md:px-6 lg:px-10">
          {children}
        </main>
        <LazyCourseAiWidget />
        <Footer />
      </div>
    </PublicSessionGate>
  );
}
