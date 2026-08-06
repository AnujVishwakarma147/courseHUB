"use client";

import {
  createContext,
  type ReactNode,
  useContext,
} from "react";

import { RouteLoader } from "@/components/general/RouteLoader";
import { authClient } from "@/lib/auth-client";

export type PublicSessionUser = {
  name: string;
  email: string;
  image?: string | null;
};

type PublicSessionValue = {
  user: PublicSessionUser | null;
};

const PublicSessionContext = createContext<PublicSessionValue | null>(null);

export function PublicSessionGate({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <RouteLoader />;
  }

  return (
    <PublicSessionContext.Provider
      value={{ user: session?.user ?? null }}
    >
      {children}
    </PublicSessionContext.Provider>
  );
}

export function usePublicSession() {
  const value = useContext(PublicSessionContext);

  if (!value) {
    throw new Error(
      "usePublicSession must be used inside PublicSessionGate",
    );
  }

  return value;
}
