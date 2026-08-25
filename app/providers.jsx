"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth-context";

export function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            // Retrying a 401/403/404 only delays the error the user needs to see.
            retry: (failureCount, error) =>
              failureCount < 2 && ![400, 401, 403, 404, 409].includes(error?.status),
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        {/* Offset clears the 56px sticky topbar — on narrow screens sonner
            goes full-width and would otherwise sit on top of it. */}
        <Toaster
          position="top-right"
          richColors
          closeButton
          offset={{ top: 68, right: 16 }}
          mobileOffset={{ top: 68, left: 12, right: 12 }}
          toastOptions={{ duration: 3500 }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}
