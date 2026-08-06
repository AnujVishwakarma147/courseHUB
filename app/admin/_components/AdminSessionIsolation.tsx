"use client";

import { useEffect } from "react";

import { authClient } from "@/lib/auth-client";

type AdminSessionIsolationProps = {
  adminUserId: string;
};

export function AdminSessionIsolation({
  adminUserId,
}: AdminSessionIsolationProps) {
  useEffect(() => {
    let cancelled = false;

    async function clearLegacySharedSession() {
      const session = await authClient.getSession();

      if (
        cancelled ||
        session.data?.user.id !== adminUserId
      ) {
        return;
      }

      await authClient.signOut();
    }

    void clearLegacySharedSession();

    return () => {
      cancelled = true;
    };
  }, [adminUserId]);

  return null;
}
