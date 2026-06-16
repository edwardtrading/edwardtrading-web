import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, PackageCheck } from "lucide-react";
import type { ProductCategory } from "@/lib/fallback-data";

type CategoryCardProps = {
  category: ProductCategory;
};

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group block overflow-hidden rounded-lg border border-charcoal/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-light-gray">
        {category.imageUrl ? (
          <>
            <Image
              src={category.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-105"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-charcoal/5 to-transparent" />
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(255,172,0,0.24),transparent_34%),linear-gradient(135deg,#f7f8f5,#e9f1ed)]">
            <span className="flex h-14 w-14 items-center justify-center rounded-md bg-white text-primary shadow-sm">
              <PackageCheck aria-hidden className="h-7 w-7" />
            </span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
            <PackageCheck aria-hidden className="h-5 w-5" />
          </span>
          <ArrowUpRight
            aria-hidden
            className="h-5 w-5 text-charcoal/30 transition group-hover:text-primary"
          />
        </div>
        <h3 className="font-heading text-xl font-bold text-charcoal">
          {category.name}
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate">
          {category.summary}
        </p>
      </div>
    </Link>
  );
}
