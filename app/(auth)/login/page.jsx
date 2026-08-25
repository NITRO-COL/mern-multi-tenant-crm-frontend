"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Eye, EyeOff, Zap } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { DemoCredentials } from "@/components/shared/DemoCredentials";

/** Client-side rules mirror the server's — the server still re-validates. */
const schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, status } = useAuth();
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  // Already signed in — skip the form.
  useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard");
  }, [status, router]);

  useEffect(() => {
    if (searchParams.get("expired")) {
      toast.info("Your session expired. Please sign in again.");
    }
    setFocus("email");
  }, [searchParams, setFocus]);

  const onSubmit = async (values) => {
    setServerError("");
    try {
      const result = await login(values);
      toast.success(`Welcome back, ${result.user.name.split(" ")[0]}`);
      router.replace("/dashboard");
    } catch (error) {
      setServerError(error.message);
    }
  };

  /** One-click fill from the demo credentials panel. */
  const fillCredentials = (email, password) => {
    setValue("email", email, { shouldValidate: true });
    setValue("password", password, { shouldValidate: true });
    setServerError("");
  };

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Brand panel — desktop only; on mobile the form gets the full viewport. */}
      <div className="relative hidden flex-1 flex-col justify-between bg-[var(--primary)] p-10 text-white lg:flex">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <Zap className="h-4.5 w-4.5" />
          </div>
          <span className="font-semibold tracking-tight">Morsh CRM</span>
        </div>

        <div className="max-w-md">
          <h1 className="text-3xl font-semibold tracking-tight">
            One CRM. Many organizations. Zero data crossover.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/75">
            Every lead, customer and activity is scoped to the tenant on your access token —
            derived server-side, never supplied by the browser.
          </p>
        </div>

        <p className="text-xs text-white/50">Multi-tenant CRM · Technical assessment</p>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex justify-end p-4">
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-10">
          <div className="w-full max-w-sm">
            <div className="mb-7 flex items-center gap-2.5 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)]">
                <Zap className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="font-semibold tracking-tight">Morsh CRM</span>
            </div>

            <h2 className="text-xl font-semibold tracking-tight">Sign in</h2>
            <p className="mt-1 text-sm text-muted">Enter your credentials to access your workspace.</p>

            {serverError && (
              <div
                role="alert"
                className="mt-5 flex items-start gap-2.5 rounded-md border border-[var(--danger)]/25 bg-[var(--danger-soft)] px-3.5 py-2.5"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--danger)]" />
                <p className="text-sm text-[var(--danger)]">{serverError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
              <Field label="Email" error={errors.email?.message} required>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  error={errors.email}
                  {...register("email")}
                />
              </Field>

              <Field label="Password" error={errors.password?.message} required>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="pr-10"
                    error={errors.password}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-[var(--text-subtle)] hover:text-[var(--text)]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              <Button type="submit" size="lg" loading={isSubmitting} className="w-full">
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>

            <DemoCredentials onSelect={fillCredentials} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
