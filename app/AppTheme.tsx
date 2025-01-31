"use client";

import { ThemeProvider } from "next-themes";
import type React from "react"; // Added import for React

export function AppTheme({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
