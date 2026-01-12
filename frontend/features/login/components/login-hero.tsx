import { ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { LoginFeatureCard } from "./login-feature-card";

export function LoginHero() {
  return (
    <div className="max-w-xl space-y-5">
      <h1 className="text-4xl font-semibold tracking-tight">
        Streamline your product management workflow
      </h1>
      <p className="text-base text-muted-foreground">
        Manage inventory, track products, and collaborate with your team
        seamlessly in one powerful platform.
      </p>
      <div className="grid gap-3">
        <LoginFeatureCard
          icon={Sparkles}
          title="Intuitive dashboard"
          description="Get a clear overview of your products and inventory at a glance."
          iconColor="text-[#6e3ff3]"
        />
        <LoginFeatureCard
          icon={TrendingUp}
          title="Real-time insights"
          description="Make data-driven decisions with up-to-date analytics and reports."
          iconColor="text-[#35b9e9]"
        />
        <LoginFeatureCard
          icon={ShieldCheck}
          title="Enterprise security"
          description="Your data is protected with industry-standard security measures."
          iconColor="text-emerald-400"
        />
      </div>
    </div>
  );
}
