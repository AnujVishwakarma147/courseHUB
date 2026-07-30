import { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import  Logo from "@/public/logo.png"
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-x-hidden px-4 lg:min-h-[125svh] lg:[zoom:0.8]">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "absolute left-4 top-4 gap-2 md:left-8 md:top-8"
        )}
      >
        <ArrowLeft className="size-4" />
        <span>Back</span>
      </Link>

      <div className="flex w-full max-w-sm flex-col gap-6">

        <Link className="flex items-center gap-2 self-center font-medium" 
        href="/">
          <Image src={Logo} alt="Logo" width={32} height={32} />
          MarshalLMS
        </Link>

        {children}

        <div className="text-balance text-center text-xs text-muted-foreground">
          By clicking continue, you agree to our{" "} <span className="hover:text-primary hover:underline">Terms of Service</span> and {" "}<span>Privacy Policy</span>.
        </div>

      </div>
    </div>
  );
}
