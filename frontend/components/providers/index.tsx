"use client";

import { ThemeProvider } from "./theme-provider";
import { TRPCProvider } from "./trpc-provider";
import { AuthProvider } from "./auth-provider";
import { Toaster } from "@/components/ui/sonner";

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <TRPCProvider>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </TRPCProvider>
    </ThemeProvider>
  );
}
