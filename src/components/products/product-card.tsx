import Image from "next/image";
import Link from "next/link";
import { PackageCheck } from "lucide-react";
import type { Product } from "@/lib/fallback-data";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-charcoal/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft"
    >
      <div className="relative aspect-square bg-light-gray">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#f6f7f5,#fff1cf)]">
            <span className="flex h-16 w-16 items-center justify-center rounded-md bg-white text-primary shadow-sm">
              <PackageCheck aria-hidden className="h-8 w-8" />
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h2 className="font-heading text-lg font-bold leading-6 text-charcoal">
          {product.name}
        </h2>
      </div>
    </Link>
  );
}
