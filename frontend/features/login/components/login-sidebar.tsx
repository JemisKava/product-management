import { LoginBrand } from "./login-brand";
import { LoginHero } from "./login-hero";

export function LoginSidebar() {
  return (
    <div className="hidden lg:flex flex-col justify-between p-12">
      <LoginBrand />
      <LoginHero />
      <p className="text-xs text-muted-foreground">
        Need assistance? Contact your system administrator.
      </p>
    </div>
  );
}
