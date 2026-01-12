import { Atom } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type AuthLoadingScreenProps = {
  variant?: "login" | "dashboard";
};

export function AuthLoadingScreen({
  variant = "dashboard",
}: AuthLoadingScreenProps) {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(900px_circle_at_10%_10%,rgba(110,63,243,0.18),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(800px_circle_at_90%_20%,rgba(53,185,233,0.12),transparent_45%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(1000px_circle_at_50%_120%,rgba(226,85,242,0.12),transparent_45%)]" />
      </div>

      {variant === "login" ? (
        <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden lg:flex flex-col justify-between p-12">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-linear-to-b from-[#6e3ff3] to-[#aa8ef9] text-white">
                <Atom className="size-5" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2.5 w-32" />
              </div>
            </div>

            <div className="max-w-xl space-y-5">
              <div className="space-y-3">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="grid gap-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`login-feature-${index}`}
                    className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/70 px-4 py-3"
                  >
                    <Skeleton className="size-8 rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-2.5 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Skeleton className="h-3 w-40" />
          </div>

          <div className="flex items-center justify-center p-6 lg:p-12">
            <div className="w-full max-w-md rounded-xl border border-border/60 bg-card/85 shadow-lg backdrop-blur px-6 py-7 space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-56" />
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-2.5 w-28" />
                <Skeleton className="h-2.5 w-52" />
                <Skeleton className="h-2.5 w-44" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex min-h-screen">
          <aside className="hidden lg:flex w-72 flex-col border-r border-border/60 bg-sidebar/80 p-6">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-md bg-linear-to-b from-[#6e3ff3] to-[#aa8ef9] text-white">
                <Atom className="size-4" />
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
            <div className="mt-8 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={`nav-${index}`} className="h-9 w-full" />
              ))}
            </div>
            <div className="mt-auto pt-6">
              <Skeleton className="h-10 w-full" />
            </div>
          </aside>

          <div className="flex-1 flex flex-col">
            <div className="border-b border-border/60 bg-card/80 px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-4 w-36" />
                <div className="ml-auto hidden md:flex items-center gap-2">
                  <Skeleton className="h-9 w-32 rounded-full" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <Skeleton className="h-9 w-9 rounded-full" />
                </div>
              </div>
            </div>

            <main className="flex-1 overflow-auto p-4 sm:p-6 space-y-6">
              <div className="rounded-xl border border-border/60 bg-card/70 p-6 space-y-3">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-72" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={`stat-${index}`} className="h-24 w-full" />
                ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>

              <div className="rounded-xl border border-border/60 bg-card/70 p-6 space-y-3">
                <Skeleton className="h-5 w-40" />
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={`row-${index}`} className="h-4 w-full" />
                ))}
              </div>
            </main>
          </div>
        </div>
      )}

      <span className="sr-only" role="status" aria-live="polite">
        Loading
      </span>
    </div>
  );
}
