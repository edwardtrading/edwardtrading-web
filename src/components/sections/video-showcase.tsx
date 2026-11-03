"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";

type VideoSource = {
  src: string;
  /** Optional media query, e.g. a lighter file for phones. */
  media?: string;
};

type VideoShowcaseProps = {
  title: string;
  poster: string;
  /** Ordered best match first; the browser plays the first one whose media query fits. */
  sources: VideoSource[];
  durationLabel?: string;
};

/**
 * Click-to-play video. Until the visitor presses play only the poster image is
 * downloaded; the <video> element (and its first byte of video) is created on
 * click, so the page itself loads as fast as it would without a video.
 */
export function VideoShowcase({
  title,
  poster,
  sources,
  durationLabel
}: VideoShowcaseProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-charcoal shadow-soft">
      {isPlaying ? (
        <video
          className="absolute inset-0 h-full w-full bg-charcoal object-contain"
          poster={poster}
          controls
          autoPlay
          playsInline
          preload="auto"
          aria-label={title}
        >
          {sources.map((source) => (
            <source
              key={source.src}
              src={source.src}
              media={source.media}
              type="video/mp4"
            />
          ))}
        </video>
      ) : (
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          className="group absolute inset-0 h-full w-full focus-visible:outline focus-visible:outline-4 focus-visible:-outline-offset-4 focus-visible:outline-primary"
          aria-label={`Play video: ${title}`}
        >
          <Image
            src={poster}
            alt=""
            fill
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/10 to-transparent" />
          <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-white shadow-glow transition duration-300 group-hover:scale-110 md:h-24 md:w-24">
            <span className="absolute inset-0 animate-ping rounded-full bg-primary/40 motion-reduce:hidden" />
            <Play aria-hidden className="relative ml-1 h-8 w-8 fill-current md:h-10 md:w-10" />
          </span>
          <span className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-left text-white md:bottom-7 md:left-7 md:right-7">
            <span className="font-heading text-lg font-bold md:text-2xl">{title}</span>
            {durationLabel ? (
              <span className="shrink-0 rounded-md bg-white/15 px-2.5 py-1 text-xs font-bold backdrop-blur">
                {durationLabel}
              </span>
            ) : null}
          </span>
        </button>
      )}
    </div>
  );
}
