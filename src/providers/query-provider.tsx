"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0, // Always fetch fresh data to avoid stale UI bugs
        gcTime: 1000 * 60 * 15, // 15 minutes to keep unused data in memory
        refetchOnWindowFocus: true, // Automatically update when user switches back to the app
        retry: 1, // Only retry failed requests once instead of 3 times
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
