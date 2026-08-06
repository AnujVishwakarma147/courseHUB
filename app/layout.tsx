import type { Metadata } from "next";
import { Geist } from "next/font/google";

import "./globals.css";

import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "CourseHUB",
    template: "%s | CourseHUB",
  },
  description:
    "Learn modern skills through structured online courses.",
  applicationName: "CourseHUB",
  keywords: [
    "online courses",
    "learning management system",
    "skill development",
  ],
  openGraph: {
    type: "website",
    siteName: "CourseHUB",
    title: "CourseHUB",
    description:
      "Learn modern skills through structured online courses.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body
        className={`${geistSans.variable} h-full antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
