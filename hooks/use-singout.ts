"use client";

import {
  adminAuthClient,
  authClient,
} from "@/lib/auth-client";
import { toast } from "sonner";

export function useSignOut(authMode: "user" | "admin" = "user") {
  const activeAuthClient = authMode === "admin"
    ? adminAuthClient
    : authClient;

  const handleSignOut = async () => {
    const toastId = toast.loading("Signing out...");

    try {
      const result = await activeAuthClient.signOut();

      if (result.error) {
        toast.error("Failed to sign out", { id: toastId });
        return;
      }

      toast.success("Signed out successfully", { id: toastId });

      window.location.replace(
        authMode === "admin"
          ? "/login?callbackURL=%2Fadmin"
          : "/",
      );
    } catch {
      toast.error("Failed to sign out", { id: toastId });
    }
  };

  return handleSignOut;
}
