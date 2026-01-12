import { LucideIcon } from "lucide-react";

interface LoginFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColor: string;
}

export function LoginFeatureCard({
  icon: Icon,
  title,
  description,
  iconColor,
}: LoginFeatureCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/70 px-4 py-3">
      <Icon className={`size-4 ${iconColor}`} />
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
