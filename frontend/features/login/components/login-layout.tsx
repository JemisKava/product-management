import { LoginBackground } from "./login-background";
import { LoginCard } from "./login-card";
import { LoginSidebar } from "./login-sidebar";

export function LoginLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <LoginBackground />
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <LoginSidebar />
        <div className="flex items-center justify-center p-6 lg:p-12">
          <LoginCard />
        </div>
      </div>
    </div>
  );
}
