"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { loginSchema, type LoginFormValues } from "../schema";

export function LoginForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      toast.success("Login successful", {
        description: `Welcome back, ${data.user.name}!`,
      });
      setAuth(data.user, data.permissions, data.accessToken);
      form.reset();
      router.push("/");
    },
    onError: (error) => {
      toast.error("Login failed", {
        description:
          error.message || "Please check your credentials and try again.",
      });
      form.setError("root", {
        message: error.message || "Login failed. Please try again.",
      });
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    form.clearErrors("root");
    loginMutation.mutate(values);
  };

  const clearRootError = () => {
    if (form.formState.errors.root) {
      form.clearErrors("root");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  disabled={loginMutation.isPending}
                  {...field}
                  onChange={(event) => {
                    field.onChange(event);
                    clearRootError();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  disabled={loginMutation.isPending}
                  {...field}
                  onChange={(event) => {
                    field.onChange(event);
                    clearRootError();
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root?.message && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {form.formState.errors.root?.message}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </Form>
  );
}
