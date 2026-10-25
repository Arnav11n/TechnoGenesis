"use client";

import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: string;
  hint?: string;
}

export function PasswordField({
  label,
  error,
  hint,
  className,
  id,
  ...props
}: PasswordFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;
  const [visible, setVisible] = useState(false);

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-bone-300"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={inputId}
          type={visible ? "text" : "password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? messageId : undefined}
          className={cn(
            "w-full rounded-xl border bg-ink-800/60 py-3 pl-4 pr-12 text-bone-50 outline-none transition-all duration-200 placeholder:text-bone-500 hover:border-bone-100/25 focus:border-lime-glow focus:bg-ink-800 focus:ring-4 focus:ring-lime-glow/10",
            error ? "border-red-400/70" : "border-bone-100/15",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-bone-500 transition-colors hover:text-lime-glow"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>

      {error ? (
        <p id={messageId} role="alert" className="text-sm text-red-300">
          {error}
        </p>
      ) : hint ? (
        <p id={messageId} className="text-sm text-bone-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}