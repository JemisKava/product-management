import { ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { LoginFeatureCard } from "./login-feature-card";

export function LoginHero() {
  return (
    <div className="max-w-xl space-y-5">
      <h1 className="text-4xl font-semibold tracking-tight">
        Organize products, permissions, and sales in one workspace.
      </h1>
      <p className="text-base text-muted-foreground">
        Modern dashboards, real-time insights, and secure access control
        designed for growing teams.
      </p>
      <div className="grid gap-3">
        <LoginFeatureCard
          icon={Sparkles}
          title="Smart dashboards"
          description="Track revenue, leads, and pipeline health instantly."
          iconColor="text-[#6e3ff3]"
        />
        <LoginFeatureCard
          icon={TrendingUp}
          title="Actionable analytics"
          description="Spot trends and keep your team aligned."
          iconColor="text-[#35b9e9]"
        />
        <LoginFeatureCard
          icon={ShieldCheck}
          title="Secure by default"
          description="JWT access with refresh tokens and role protection."
          iconColor="text-emerald-400"
        />
      </div>
    </div>
  );
}
