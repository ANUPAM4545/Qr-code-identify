"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    // Refresh on mount to clear Next.js client router cache
    router.refresh();

    // Refresh when user switches tabs back to the app
    const handleFocus = () => {
      router.refresh();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [router]);

  return null;
}
