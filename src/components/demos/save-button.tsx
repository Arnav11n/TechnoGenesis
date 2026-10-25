"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bookmark, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SaveButton({ data }: { data: Record<string, unknown> }) {
  const { data: session, status } = useSession();
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  if (status === "loading") return null;

  if (!session) {
    return (
      <p className="text-sm text-bone-300">
        <Link href="/login" className="text-lime-glow underline-offset-4 hover:underline">
          Sign in
        </Link>{" "}
        to save this to your account.
      </p>
    );
  }

  async function save() {
    setState("saving");
    setError(null);
    try {
      const res = await fetch("/api/account/saves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const out = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(out.error ?? "Could not save.");
      setState("saved");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
      setState("idle");
    }
  }

  return (
    <div>
      <Button variant="outline" onClick={save} loading={state === "saving"} disabled={state === "saved"}>
        {state === "saved" ? <Check className="size-4" /> : <Bookmark className="size-4" />}
        {state === "saved" ? "Saved to your account" : "Save to my account"}
      </Button>
      {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
    </div>
  );
}