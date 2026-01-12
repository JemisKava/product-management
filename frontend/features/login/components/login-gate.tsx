"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { AuthLoadingScreen } from "@/components/ui/auth-loading";

type LoginGateProps = {
  children: React.ReactNode;
};

export function LoginGate({ children }: LoginGateProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/products");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || isAuthenticated) {
    return <AuthLoadingScreen variant="login" />;
  }

  return children;
}
