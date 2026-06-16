import { ProductCard } from "@/components/products/product-card";
import { Reveal } from "@/components/ui/reveal";
import type { Product } from "@/lib/fallback-data";

type ProductGridProps = {
  products: Product[];
  emptyText?: string;
};

export function ProductGrid({ products, emptyText }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-charcoal/10 bg-light-gray p-8 text-sm leading-7 text-slate">
        {emptyText ?? "Products will appear here after they are published."}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product, index) => (
        <Reveal key={product.slug} delay={index * 0.04}>
          <ProductCard product={product} />
        </Reveal>
      ))}
    </div>
  );
}
