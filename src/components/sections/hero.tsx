"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Microscope, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CmsPage } from "@/lib/cms-data";

export function Hero({ content }: { content: CmsPage }) {
  const words = content.title.split(/\s+/).filter(Boolean);

  return (
    <section className="relative isolate overflow-hidden bg-mesh-warm">
      <div className="container-page grid min-h-[calc(100svh-80px)] items-center gap-12 py-14 lg:grid-cols-[1fr_0.9fr] lg:py-20">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 inline-flex items-center gap-2 rounded-md border border-primary/20 bg-white/70 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary"
          >
            <Sparkles aria-hidden className="h-4 w-4" />
            {content.eyebrow}
          </motion.p>
          <h1 className="max-w-3xl font-heading text-4xl font-extrabold leading-[1.06] text-charcoal text-balance md:text-6xl">
            {words.map((word, index) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 34 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.1 + index * 0.08,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="mr-3 inline-block"
              >
                {word}
              </motion.span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.62 }}
            className="mt-6 max-w-2xl text-base leading-8 text-slate text-pretty md:text-lg"
          >
            {content.description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.75 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row"
          >
            <Button href={content.ctaHref || "/solutions"}>
              {content.ctaLabel || "Explore Solutions"}
            </Button>
            <Button href="/contact" variant="secondary">
              Contact Edward Trading
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96, rotateX: 6 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ duration: 0.8, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="relative min-h-[520px] lg:min-h-[620px]"
        >
          <div className="absolute inset-x-0 top-5 mx-auto h-[82%] max-w-[520px] rounded-lg bg-charcoal shadow-soft" />
          <div className="absolute inset-x-5 top-0 overflow-hidden rounded-lg border border-white/70 bg-white shadow-soft">
            {content.videoUrl ? (
              <div className="relative aspect-[4/5]">
                <video
                  src={content.videoUrl}
                  poster={content.imageUrl || undefined}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/72 via-charcoal/8 to-transparent" />
              </div>
            ) : content.imageUrl ? (
              <div className="relative aspect-[4/5]">
                <Image
                  src={content.imageUrl}
                  alt="Edward Trading product supply"
                  fill
                  priority
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/72 via-charcoal/8 to-transparent" />
              </div>
            ) : (
              <div className="relative aspect-[4/5] overflow-hidden bg-charcoal p-8 text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,172,0,0.32),transparent_34%),linear-gradient(145deg,#171717,#2c342f)]" />
                <div className="relative flex h-full flex-col justify-between rounded-lg border border-white/10 bg-white/[0.06] p-6">
                  <span className="flex h-14 w-14 items-center justify-center rounded-md bg-primary text-white">
                    <Microscope aria-hidden className="h-7 w-7" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-light">
                      Edward Trading Pvt. Ltd.
                    </p>
                    <p className="mt-3 font-heading text-4xl font-extrabold leading-tight">
                      Diagnostic, medical, surgical, hygiene, and hospital supply.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="glass-surface absolute bottom-12 left-0 w-[min(310px,75%)] rounded-lg p-5"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-mint text-charcoal">
                <ShieldCheck aria-hidden className="h-5 w-5" />
              </span>
              <div>
                <p className="font-heading text-base font-bold text-charcoal">
                  Quality-led sourcing
                </p>
                <p className="mt-1 text-sm leading-6 text-slate">
                  Healthcare, hygiene, and facility products aligned with
                  practical supply requirements.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
            className="glass-surface absolute right-0 top-20 w-[min(260px,70%)] rounded-lg p-5"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-white">
                <Truck aria-hidden className="h-5 w-5" />
              </span>
              <div>
                <p className="font-heading text-sm font-bold text-charcoal">
                  Transparent coordination
                </p>
                <p className="text-xs leading-5 text-slate">Inquiry to supply planning</p>
              </div>
            </div>
          </motion.div> */}
        </motion.div>
      </div>
      <div className="container-page -mt-5 grid gap-3 pb-10 sm:grid-cols-3">
        {["Hygiene & Housekeeping Solutions", "Healthcare Products", "Hospital Furnitures"].map(
          (item) => (
            <a
              key={item}
              href="/solutions"
              className="flex min-h-14 items-center justify-between rounded-md border border-charcoal/10 bg-white/72 px-4 text-sm font-semibold text-charcoal backdrop-blur transition hover:border-primary/30 hover:text-primary"
            >
              {item}
              <ArrowRight aria-hidden className="h-4 w-4" />
            </a>
          )
        )}
      </div>
    </section>
  );
}
