"use client";

import { WelcomeSection } from "./welcome-section";

export function DashboardContent() {
  return (
    <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 bg-background w-full">
      <WelcomeSection />
    </main>
  );
}
