import { LoginGate } from "@/features/login/components/login-gate";
import { LoginLayout } from "@/features/login/components/login-layout";

export default function LoginPage() {
  return (
    <LoginGate>
      <LoginLayout />
    </LoginGate>
  );
}
