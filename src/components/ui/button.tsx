import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "dark" | "ghost";
  className?: string;
};

const variants = {
  primary:
    "bg-primary text-white shadow-glow hover:bg-primary-light focus-visible:outline-primary",
  secondary:
    "border border-charcoal/10 bg-white text-charcoal hover:border-primary/40 hover:text-primary focus-visible:outline-primary",
  dark: "bg-charcoal text-white hover:bg-soft-black focus-visible:outline-white",
  ghost:
    "bg-transparent text-charcoal hover:bg-charcoal/5 focus-visible:outline-primary"
};

export function Button({
  href,
  children,
  variant = "primary",
  className
}: ButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        variants[variant],
        className
      )}
    >
      <span>{children}</span>
      <ArrowRight aria-hidden className="h-4 w-4" />
    </Link>
  );
}
