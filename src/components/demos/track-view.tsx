"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

/** Quietly records that a signed-in person opened a lab. Renders nothing. */
export function TrackView() {
  const pathname = usePathname();
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;
    const demo = pathname.split("/").filter(Boolean).pop();
    if (!demo) return;
    fetch("/api/interactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ demo }),
    }).catch(() => {});
  }, [pathname, status]);

  return null;
}