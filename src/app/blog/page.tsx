import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock, Newspaper } from "lucide-react";
import { PageHero } from "@/components/sections/page-hero";
import { Reveal } from "@/components/ui/reveal";
import { getBlogPosts, getPageContent } from "@/lib/cms-data";
import { readingTimeMinutes } from "@/lib/rich-text";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site-data";
import { formatPublishedDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPageContent("blog");

  return buildMetadata({
    metaTitle: content.metaTitle,
    fallbackTitle: "Blog",
    metaDescription: content.metaDescription,
    descriptionSources: [content.description],
    keywords: content.metaKeywords,
    path: "/blog",
    images: [content.imageUrl]
  });
}

export default async function BlogPage() {
  const [content, posts] = await Promise.all([
    getPageContent("blog"),
    getBlogPosts()
  ]);

  const structuredData = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" }
    ]),
    {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: `${site.name} Blog`,
      url: `${site.url}/blog`,
      description: content.metaDescription || content.description,
      blogPost: posts.map((post) => ({
        "@type": "BlogPosting",
        headline: post.title,
        url: `${site.url}/blog/${post.slug}`,
        datePublished: post.publishedAt,
        image: post.coverImageUrl || undefined,
        author: {
          "@type": post.author ? "Person" : "Organization",
          name: post.author || site.name
        }
      }))
    }
  ];

  return (
    <>
      {structuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <PageHero
        eyebrow={content.eyebrow || "Insights & Updates"}
        title={content.title}
        description={content.description}
        image={content.imageUrl}
        ctaLabel={content.ctaLabel || "Contact Edward Trading"}
        ctaHref={content.ctaHref || "/contact"}
      />

      <section className="bg-white py-16 md:py-20">
        <div className="container-page">
          {posts.length === 0 ? (
            <div className="rounded-lg bg-light-gray p-8 text-sm leading-7 text-slate">
              No articles have been published yet. Check back soon.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => {
                const published = formatPublishedDate(post.publishedAt);

                return (
                  <Reveal key={post.slug} delay={index * 0.05}>
                    <article className="flex h-full flex-col overflow-hidden rounded-lg border border-charcoal/10 bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="relative block aspect-[16/9] bg-light-gray"
                      >
                        {post.coverImageUrl ? (
                          <Image
                            src={post.coverImageUrl}
                            alt={post.coverImageAlt || post.title}
                            fill
                            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="flex h-full items-center justify-center">
                            <Newspaper aria-hidden className="h-10 w-10 text-primary" />
                          </span>
                        )}
                      </Link>

                      <div className="flex flex-1 flex-col p-6">
                        {post.category ? (
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                            {post.category}
                          </p>
                        ) : null}
                        <h2 className="mt-3 font-heading text-xl font-extrabold leading-snug text-charcoal">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="transition hover:text-primary"
                          >
                            {post.title}
                          </Link>
                        </h2>
                        <p className="mt-3 flex-1 text-sm leading-7 text-slate">
                          {post.excerpt}
                        </p>

                        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate">
                          {published ? (
                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays aria-hidden className="h-3.5 w-3.5 text-primary" />
                              <time dateTime={post.publishedAt}>{published}</time>
                            </span>
                          ) : null}
                          <span className="inline-flex items-center gap-1.5">
                            <Clock aria-hidden className="h-3.5 w-3.5 text-primary" />
                            {readingTimeMinutes(post.content)} min read
                          </span>
                        </div>

                        <Link
                          href={`/blog/${post.slug}`}
                          className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-charcoal transition hover:text-primary"
                        >
                          Read article
                          <ArrowRight aria-hidden className="h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
