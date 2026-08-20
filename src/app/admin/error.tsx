"use client";

import { RefreshCcw, TriangleAlert } from "lucide-react";
import { useEffect } from "react";

/**
 * Recovery screen for the editor.
 *
 * The most common cause is a page that was left open while the site was
 * updated: the buttons on the old page point at code that no longer exists, so
 * every save fails until the page is reloaded. Reloading is therefore the first
 * thing offered here.
 */
export default function AdminError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <section className="min-h-[calc(100svh-80px)] bg-light-gray py-12">
      <div className="container-page max-w-2xl">
        <div className="rounded-lg border border-charcoal/10 bg-white p-6 shadow-sm md:p-8">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
            <TriangleAlert aria-hidden className="h-4 w-4" />
            Something went wrong
          </p>
          <h1 className="mt-4 font-heading text-3xl font-extrabold text-charcoal">
            That change could not be saved
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate">
            This usually happens when the editor has been left open for a while
            and the website has been updated in the meantime. Reloading the page
            fixes it, and nothing you had already saved is affected.
          </p>

          <ol className="mt-6 grid gap-2 text-sm leading-7 text-charcoal">
            <li>1. Reload the page using the button below.</li>
            <li>2. Open the item again and re-enter your change.</li>
            <li>3. Press save.</li>
          </ol>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-light"
            >
              <RefreshCcw aria-hidden className="h-4 w-4" />
              Reload the page
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-11 items-center rounded-md border border-charcoal/12 bg-white px-4 text-sm font-semibold text-charcoal transition hover:border-primary hover:text-primary"
            >
              Try again
            </button>
            <a
              href="/admin"
              className="inline-flex min-h-11 items-center rounded-md border border-charcoal/12 bg-white px-4 text-sm font-semibold text-charcoal transition hover:border-primary hover:text-primary"
            >
              Back to the dashboard
            </a>
          </div>

          <p className="mt-6 border-t border-charcoal/10 pt-4 text-xs leading-6 text-slate">
            If it keeps happening, send this reference to your website support
            team:{" "}
            <span className="font-mono font-bold text-charcoal">
              {error.digest || "no reference available"}
            </span>
          </p>
        </div>
      </div>
    </section>
  );
}
