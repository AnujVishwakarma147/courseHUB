"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function CertificatePrintButton() {
  return (
    <Button
      type="button"
      onClick={() => window.print()}
      className="h-11 rounded-none px-5 text-base"
    >
      <Download className="size-4" />
      Download / Print Certificate
    </Button>
  );
}
