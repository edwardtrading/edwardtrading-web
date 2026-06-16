import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  invert?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  invert
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        invert ? "text-white" : "text-charcoal"
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 text-xs font-bold uppercase tracking-[0.18em]",
            invert ? "text-primary-light" : "text-primary"
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-heading text-3xl font-extrabold leading-tight text-balance md:text-5xl">
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "mt-5 text-base leading-8 text-pretty md:text-lg",
            invert ? "text-white/72" : "text-slate"
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
