"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "./auth-provider";
import { QueryProvider } from "./query-provider";
import { WorkspaceProvider } from "./workspace-provider";
import { EventProvider } from "./event-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <QueryProvider>
          <WorkspaceProvider>
            <EventProvider>
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </EventProvider>
          </WorkspaceProvider>
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
