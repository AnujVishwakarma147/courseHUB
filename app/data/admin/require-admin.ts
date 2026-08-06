import "server-only";

import arcjet from "@/lib/arcjet";
import { adminAuth } from "@/lib/auth";
import { request } from "@arcjet/next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

export const requireAdmin = cache(async () => {
  const session = await adminAuth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect("/login?callbackURL=%2Fadmin");
  }

  if (session.user.role !== "admin") {
    return redirect("/not-admin");
  }

  const decision = await arcjet.protect(await request(), {
    fingerprint: session.user.id,
  });

  if (decision.isDenied()) {
    return redirect("/not-admin");
  }

  return session;
});
