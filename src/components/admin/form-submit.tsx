"use client";

import { CheckCircle2, LoaderCircle, Save, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
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
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-light disabled:cursor-wait disabled:opacity-60"
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

/**
 * Save bar that sticks to the bottom of the viewport while an editor works
 * through a long form, so the save action is always one click away. It also
 * blocks the page while a save is in flight, which stops the double submits
 * that duplicate entries.
 */
export function StickySaveBar({
  disabled,
  label,
  hint
}: {
  disabled?: boolean;
  label?: string;
  hint?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <div className="sticky bottom-0 z-10 -mx-5 mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-charcoal/10 bg-white/95 px-5 py-3 backdrop-blur md:-mx-6 md:px-6">
      <p className="text-xs font-semibold text-slate">
        {pending ? "Saving your changes..." : hint ?? "Changes go live as soon as you save."}
      </p>
      <SaveButton disabled={disabled} label={label} />
    </div>
  );
}

export function SavedNotice({ message }: { message?: string }) {
  const [visible, setVisible] = useState(Boolean(message));

  // The message arrives as a query parameter after the redirect, so it would
  // otherwise sit on screen until the next navigation.
  useEffect(() => {
    setVisible(Boolean(message));

    if (!message) {
      return;
    }

    const timer = window.setTimeout(() => setVisible(false), 6000);
    return () => window.clearTimeout(timer);
  }, [message]);

  if (!message || !visible) {
    return null;
  }

  return (
    <div
      role="status"
      className="sticky top-24 z-20 mb-6 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 shadow-sm"
    >
      <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
      <span>{message}</span>
    </div>
  );
}

/** Shown when a save was rejected, with the reason the action reported. */
export function ProblemNotice({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className="sticky top-24 z-20 mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-900 shadow-sm"
    >
      <TriangleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
      <span>{message}</span>
    </div>
  );
}
