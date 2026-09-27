"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { AuthProvider } from "./context/AuthContext";
export function Providers({ children }: { children: ReactNode }) {
  // Created inside the component (not at module scope) so each client
  // gets its own instance — matters for SSR/hydration correctness.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10_000, // slot/session data is time-sensitive; keep it fairly fresh
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}