"use client";

import { CheckCircle2, LoaderCircle, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

export function SaveButton({
  disabled,
  label = "Save changes"
}: {
  disabled?: boolean;
  label?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-light disabled:cursor-wait disabled:opacity-60"
      aria-live="polite"
    >
      {pending ? (
        <LoaderCircle aria-hidden className="h-4 w-4 animate-spin" />
      ) : (
        <Save aria-hidden className="h-4 w-4" />
      )}
      {pending ? "Saving..." : label}
    </button>
  );
}

export function SavedNotice({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <div className="mb-6 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/10 px-4 py-3 text-sm font-semibold text-charcoal shadow-sm">
      <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <span>{message}</span>
    </div>
  );
}
