import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  variant?: "dark" | "light";
  className?: string;
  priority?: boolean;
};

export function Logo({ variant = "dark", className, priority }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("relative block h-12 w-52 shrink-0", className)}
      aria-label="Edward Trading home"
    >
      <Image
        src="/edward-trading-logo.png"
        alt="Edward Trading"
        fill
        priority={priority}
        sizes="208px"
        className={cn(
          "object-contain",
          variant === "light" && "drop-shadow-[0_1px_0_rgba(255,255,255,0.15)]"
        )}
      />
    </Link>
  );
}
