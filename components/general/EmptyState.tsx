import { Ban, PlusCircle } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "../ui/button";

interface iAppProps {
  title: string;
  description: string;
  buttonText: string;
  href: string;
}

export function EmptyState({
  buttonText,
  description,
  title,
  href,
}: iAppProps) {
  return (
    <div className="flex min-h-72 w-full flex-1 animate-in flex-col items-center justify-center rounded-md border border-dashed p-8 text-center fade-in-50">
      <div className="flex size-20 items-center justify-center rounded-full bg-primary/10">
        <Ban className="size-10 text-primary" />
      </div>

      <h2 className="mt-6 text-xl font-semibold">{title}</h2>

      <p className="mb-8 mt-2 text-center text-sm leading-tight text-muted-foreground">
        {description}
      </p>

      <Link
        href={href}
        className={buttonVariants({
          className: "h-11 rounded-none px-6 text-base",
        })}
      >
        <PlusCircle className="mr-2 size-4" />
        {buttonText}
      </Link>
    </div>
  );
}
