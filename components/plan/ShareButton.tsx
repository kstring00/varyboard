"use client";

import { useState } from "react";

/** Native share where available, otherwise copy the link. The URL is the whole plan. */
export function ShareButton({ title, path, label, className = "btn-primary text-lg" }: { title: string; path: string; label: string; className?: string }) {
  const [done, setDone] = useState<"" | "shared" | "copied" | "failed">("");
  const share = async () => {
    const url = `${window.location.origin}${path}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        setDone("shared");
      } else {
        await navigator.clipboard.writeText(url);
        setDone("copied");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        setDone("copied");
      } catch {
        setDone("failed");
      }
    }
  };
  return (
    <span className="ix-share">
      <button type="button" className={className} onClick={share} data-share>
        {label}
      </button>
      <span className="ix-share__status" role="status">
        {done === "copied" && "Link copied."}
        {done === "shared" && "Sent."}
        {done === "failed" && `Copy this link: ${path}`}
      </span>
    </span>
  );
}
