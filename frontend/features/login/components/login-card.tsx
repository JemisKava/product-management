import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "./login-form";
import { LoginCredentials } from "./login-credentials";

export function LoginCard() {
  return (
    <Card className="w-full max-w-md border-border/60 bg-card/85 shadow-lg backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Sign in to continue to your workspace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter>
        <LoginCredentials />
      </CardFooter>
    </Card>
  );
}
