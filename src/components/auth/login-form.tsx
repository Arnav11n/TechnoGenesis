"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/auth/password-field";
import { KineticText } from "@/components/motion/kinetic-text";
import { Reveal } from "@/components/motion/reveal";
import { loginSchema } from "@/lib/validators";

const errorMessages: Record<string, string> = {
  INVALID_CREDENTIALS: "That email and password don't match. Please try again.",
  CredentialsSignin: "That email and password don't match. Please try again.",
  ACCOUNT_LOCKED:
    "Too many failed attempts. This account is locked for 15 minutes.",
  RATE_LIMITED: "Too many attempts. Please wait a few minutes and try again.",
  INVALID_INPUT: "Please check your email and password.",
};

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();

  // Only allow redirects to pages inside our own site.
  const requested = params.get("callbackUrl") ?? "/account";
  const callbackUrl =
    requested.startsWith("/") && !requested.startsWith("//")
      ? requested
      : "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        email: flat.email?.[0] ?? "",
        password: flat.password?.[0] ?? "",
      });
      return;
    }

    setLoading(true);
    const result = await signIn("credentials", {
      redirect: false,
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (!result || result.error) {
      setFormError(
        errorMessages[result?.error ?? ""] ??
          "Something went wrong. Please try again.",
      );
      setLoading(false);
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div>
      <p className="mb-5 font-mono text-xs uppercase tracking-[0.3em] text-lime-glow">
        Sign in
      </p>
      <h1 className="display-tight text-5xl font-extrabold text-bone-50 sm:text-6xl">
        <KineticText text="Welcome back." />
      </h1>
      <Reveal delay={0.3}>
        <p className="mt-5 text-bone-300">
          Pick up your experiments and robot builds where you left them.
        </p>
      </Reveal>

      <Reveal delay={0.4}>
        <form onSubmit={onSubmit} noValidate className="mt-10 space-y-5">
          <AnimatePresence>
            {formError && (
              <motion.div
                role="alert"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200"
              >
                {formError}
              </motion.div>
            )}
          </AnimatePresence>

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email || undefined}
          />

          <PasswordField
            label="Password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password || undefined}
          />

          <Button type="submit" size="lg" loading={loading} className="w-full">
            {loading ? "Signing in" : "Sign in"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-bone-300">
          New here?{" "}
          <Link
            href="/signup"
            className="text-lime-glow underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </Reveal>
    </div>
  );
}