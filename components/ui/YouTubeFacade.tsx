"use client";

import { useState } from "react";

/**
 * Click-to-play YouTube embed. Nothing from YouTube loads until the visitor presses play.
 * The poster is YouTube's own thumbnail for the video (not an invented image).
 */
export function YouTubeFacade({ id, title }: { id: string; title: string }) {
  const [play, setPlay] = useState(false);
  if (play) {
    return (
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-ink shadow-soft">
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => setPlay(true)}
      className="group relative block aspect-video w-full overflow-hidden rounded-2xl bg-ink shadow-soft"
      aria-label={`Play video: ${title}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        srcSet={`https://i.ytimg.com/vi/${id}/hqdefault.jpg 480w, https://i.ytimg.com/vi/${id}/maxresdefault.jpg 1280w`}
        sizes="(min-width: 1024px) 960px, 100vw"
        alt=""
        loading="lazy"
        width={1280}
        height={720}
        className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" aria-hidden="true" />
      <span className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-paper text-teal-deep shadow-soft transition-transform group-hover:scale-105 motion-reduce:transition-none">
        <svg aria-hidden="true" width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      <span className="absolute bottom-4 left-5 right-5 text-left text-lg font-semibold text-white drop-shadow">{title}</span>
    </button>
  );
}
