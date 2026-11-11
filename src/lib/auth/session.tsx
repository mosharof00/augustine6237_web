"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { setUnauthorizedHandler } from "@/lib/api/client";
import { getMe, logoutRequest } from "@/lib/api/auth";
import type { AuthUser } from "@/lib/api/types";
import { clearAccessToken, readAccessToken } from "./storage";

type SessionValue = {
  status: "loading" | "anonymous" | "ready";
  user: AuthUser | null;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<SessionValue["status"]>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    setUnauthorizedHandler(() => {
      setUser(null);
      setStatus("anonymous");
      router.replace("/sign-in");
    });
    void Promise.resolve().then(() => {
      if (cancelled) return;
      const token = readAccessToken();
      if (!token) {
        setStatus("anonymous");
        return;
      }
      getMe()
        .then((next) => {
          if (cancelled) return;
          setUser(next);
          setStatus("ready");
        })
        .catch(() => {
          if (cancelled) return;
          setUser(null);
          setStatus("anonymous");
        });
    });
    return () => {
      cancelled = true;
      setUnauthorizedHandler(null);
    };
  }, [router]);

  const value = useMemo<SessionValue>(
    () => ({
      status,
      user,
      logout: async () => {
        try {
          await logoutRequest();
        } catch {
          // A 401 already clears the token and starts the sign-in redirect.
        }
        clearAccessToken();
        setUser(null);
        setStatus("anonymous");
        router.replace("/sign-in");
      },
    }),
    [router, status, user],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error("useSession must be used inside SessionProvider");
  }
  return session;
}
