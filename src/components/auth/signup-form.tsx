"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/auth/password-field";
import { PasswordMeter } from "@/components/auth/password-meter";
import { KineticText } from "@/components/motion/kinetic-text";
import { Reveal } from "@/components/motion/reveal";
import { signupSchema } from "@/lib/validators";

export function SignupForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const parsed = signupSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setFieldErrors({
        name: flat.name?.[0] ?? "",
        email: flat.email?.[0] ?? "",
        password: flat.password?.[0] ?? "",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 409) {
          setFieldErrors({ email: data.error });
        } else if (data.fields) {
          setFieldErrors({
            name: data.fields.name?.[0] ?? "",
            email: data.fields.email?.[0] ?? "",
            password: data.fields.password?.[0] ?? "",
          });
        } else {
          setFormError(data.error ?? "Something went wrong. Please try again.");
        }
        setLoading(false);
        return;
      }

      // Account created: sign the person in straight away.
      const result = await signIn("credentials", {
        redirect: false,
        email: parsed.data.email,
        password: parsed.data.password,
      });

      if (result?.error) {
        router.push("/login");
        return;
      }

      router.push("/account");
      router.refresh();
    } catch {
      setFormError("Could not reach the server. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <p className="mb-5 font-mono text-xs uppercase tracking-[0.3em] text-lime-glow">
        Create account
      </p>
      <h1 className="display-tight text-5xl font-extrabold text-bone-50 sm:text-6xl">
        <KineticText text="Join the genesis." />
      </h1>
      <Reveal delay={0.3}>
        <p className="mt-5 text-bone-300">
          Save your neural experiments, robot builds and bookmarked milestones.
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
            label="Name"
            type="text"
            autoComplete="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={fieldErrors.name || undefined}
          />

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email || undefined}
          />

          <div className="space-y-4">
            <PasswordField
              label="Password"
              autoComplete="new-password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password || undefined}
            />
            <PasswordMeter password={password} />
          </div>

          <Button type="submit" size="lg" loading={loading} className="w-full">
            {loading ? "Creating account" : "Create account"}
          </Button>
        </form>

        <p className="mt-8 text-center text-sm text-bone-300">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-lime-glow underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </Reveal>
    </div>
  );
}