"use client";

import { Session, User } from "lucia";
import React, { createContext, useContext } from "react";

interface SessionContextValue {
  user: User;
  session: Session;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export default function SessionProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: SessionContextValue;
}) {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
