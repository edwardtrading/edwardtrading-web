"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/logo";
import { navItems } from "@/lib/site-data";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-charcoal/10 bg-white/90 backdrop-blur-xl">
      <nav
        className="container-page flex min-h-20 items-center justify-between gap-6"
        aria-label="Main navigation"
      >
        <Link
          href="/"
          className="sr-only"
          onClick={() => setOpen(false)}
        >
          Edward Trading home
        </Link>
        <div onClick={() => setOpen(false)}>
          <Logo priority />
        </div>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-semibold transition",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-charcoal/72 hover:bg-charcoal/5 hover:text-charcoal"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <Link
          href="/contact"
          className="hidden min-h-11 items-center rounded-md bg-charcoal px-4 py-2 text-sm font-semibold text-white transition hover:bg-soft-black lg:inline-flex"
        >
          Request Quote
        </Link>

        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-charcoal/10 bg-white text-charcoal lg:hidden"
        >
          {open ? <X aria-hidden className="h-5 w-5" /> : <Menu aria-hidden className="h-5 w-5" />}
        </button>
      </nav>

      {open ? (
        <div className="border-t border-charcoal/10 bg-white lg:hidden">
          <div className="container-page grid gap-2 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-semibold text-charcoal hover:bg-charcoal/5"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-md bg-primary px-3 py-3 text-center text-sm font-semibold text-white"
            >
              Request Quote
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}
