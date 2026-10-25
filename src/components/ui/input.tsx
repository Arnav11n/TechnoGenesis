"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, ...props },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const messageId = `${inputId}-message`;

  return (
    <div className="space-y-2">
      <label
        htmlFor={inputId}
        className="block font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-bone-300"
      >
        {label}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error || hint ? messageId : undefined}
        className={cn(
          "w-full rounded-xl border bg-ink-800/60 px-4 py-3 text-bone-50 outline-none transition-all duration-200 placeholder:text-bone-500 hover:border-bone-100/25 focus:border-lime-glow focus:bg-ink-800 focus:ring-4 focus:ring-lime-glow/10",
          error ? "border-red-400/70" : "border-bone-100/15",
          className,
        )}
        {...props}
      />
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
});