import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, ListTree, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBlogPostBySlug, getRelatedBlogPosts } from "@/lib/cms-data";
import {
  extractHeadings,
  readingTimeMinutes,
  withHeadingIds
} from "@/lib/rich-text";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site-data";
import { formatPublishedDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

type BlogPostPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({
  params
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Article Not Found",
      robots: { index: false, follow: false }
    };
  }

  return buildMetadata({
    metaTitle: post.metaTitle,
    fallbackTitle: post.title,
    metaDescription: post.metaDescription,
    descriptionSources: [post.excerpt, post.content],
    keywords: post.metaKeywords,
    path: `/blog/${post.slug}`,
    images: [post.coverImageUrl],
    type: "article",
    publishedTime: post.publishedAt
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const related = await getRelatedBlogPosts(post.slug);
  const content = withHeadingIds(post.content);
  const outline = extractHeadings(content).filter((heading) => heading.level === 2);
  const published = formatPublishedDate(post.publishedAt);
  const pageUrl = `${site.url}/blog/${post.slug}`;

  const structuredData = [
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` }
    ]),
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      image: post.coverImageUrl || undefined,
      datePublished: post.publishedAt,
      dateModified: post.publishedAt,
      articleSection: post.category || undefined,
      keywords:
        post.metaKeywords && post.metaKeywords.length > 0
          ? post.metaKeywords.join(", ")
          : undefined,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": pageUrl
      },
      author: {
        "@type": post.author ? "Person" : "Organization",
        name: post.author || site.name
      },
      publisher: {
        "@type": "Organization",
        name: site.name,
        url: site.url
      }
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

      <article>
        <header className="bg-mesh-warm py-14 md:py-18">
          <div className="container-page max-w-3xl">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-bold text-charcoal transition hover:text-primary"
            >
              <ArrowLeft aria-hidden className="h-4 w-4" />
              All articles
            </Link>

            {post.category ? (
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                {post.category}
              </p>
            ) : null}

            <h1 className="mt-4 font-heading text-4xl font-extrabold leading-tight text-charcoal text-balance md:text-5xl">
              {post.title}
            </h1>

            {post.excerpt ? (
              <p className="mt-6 text-lg leading-8 text-slate">{post.excerpt}</p>
            ) : null}

            <div className="mt-7 flex flex-wrap items-center gap-5 text-xs font-semibold text-slate">
              {post.author ? (
                <span className="inline-flex items-center gap-1.5">
                  <UserRound aria-hidden className="h-4 w-4 text-primary" />
                  {post.author}
                </span>
              ) : null}
              {published ? (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays aria-hidden className="h-4 w-4 text-primary" />
                  <time dateTime={post.publishedAt}>{published}</time>
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <Clock aria-hidden className="h-4 w-4 text-primary" />
                {readingTimeMinutes(post.content)} min read
              </span>
            </div>
          </div>
        </header>

        {post.coverImageUrl ? (
          <div className="bg-mesh-warm pb-14">
            <div className="container-page max-w-4xl">
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg shadow-soft">
                <Image
                  src={post.coverImageUrl}
                  alt={post.coverImageAlt || post.title}
                  fill
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                  priority
                  unoptimized
                />
              </div>
            </div>
          </div>
        ) : null}

        <div className="bg-white py-14 md:py-16">
          <div className="container-page grid gap-12 lg:grid-cols-[1fr_260px] lg:items-start">
            <div
              className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:text-charcoal prose-h2:mt-12 prose-h2:scroll-mt-28 prose-h3:mt-8 prose-h3:scroll-mt-28 prose-p:text-slate prose-p:leading-8 prose-a:text-primary prose-a:underline prose-a:underline-offset-2 prose-strong:text-charcoal prose-li:text-slate prose-blockquote:border-l-primary prose-blockquote:text-charcoal prose-img:rounded-lg prose-table:text-sm prose-th:bg-light-gray prose-th:text-charcoal prose-th:border prose-th:border-charcoal/10 prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-charcoal/10 prose-td:px-3 prose-td:py-2"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {outline.length > 1 ? (
              <aside className="order-first rounded-lg border border-charcoal/10 bg-light-gray p-5 lg:order-none lg:sticky lg:top-28">
                <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                  <ListTree aria-hidden className="h-4 w-4" />
                  On this page
                </p>
                <nav className="mt-4 grid gap-2">
                  {outline.map((heading) => (
                    <a
                      key={heading.id}
                      href={`#${heading.id}`}
                      className="text-sm font-semibold leading-6 text-slate transition hover:text-primary"
                    >
                      {heading.text}
                    </a>
                  ))}
                </nav>
              </aside>
            ) : null}
          </div>
        </div>
      </article>

      <section className="bg-light-gray py-14 md:py-16">
        <div className="container-page">
          <div className="rounded-lg bg-cta-band p-8 text-white md:p-10">
            <h2 className="font-heading text-2xl font-extrabold md:text-3xl">
              Need help sourcing what you just read about?
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
              Share your requirement, quantity range, and timeline. The{" "}
              {site.name} team will help identify the right products and next step.
            </p>
            <Button href="/contact" className="mt-7">
              Contact Edward Trading
            </Button>
          </div>

          {related.length > 0 ? (
            <div className="mt-14">
              <h2 className="font-heading text-2xl font-extrabold text-charcoal md:text-3xl">
                More articles
              </h2>
              <div className="mt-7 grid gap-5 md:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/blog/${item.slug}`}
                    className="group rounded-lg border border-charcoal/10 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft"
                  >
                    {item.category ? (
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                        {item.category}
                      </p>
                    ) : null}
                    <h3 className="mt-3 font-heading text-lg font-bold leading-snug text-charcoal transition group-hover:text-primary">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate">
                      {item.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
