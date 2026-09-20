# The Vary Board — new site plan

Replaces the Shopify theme at thevaryboard.com. Shopify stays only as checkout.
Stack: Next.js 16 (App Router) + TypeScript + Tailwind v4 + GSAP ScrollTrigger, deployed on Vercel. No CMS.

## Build order (one section at a time, review after each)

| # | Step | Status |
|---|------|--------|
| 0 | Foundation: facts.ts, reviews.ts skeleton, image pipeline, redirects, layout, header, footer, sticky buy bar, motion provider | done |
| 1 | HERO: cinematic full-bleed render with layered typography, callouts and GSAP intro/scroll motion | done, awaiting review |
| 2 | WHAT IT IS: pinned scroll scene, real board cutout stacks 1-2-3 to 75", zoom to hex anchors, handles, band clipping in | next |
| 3 | WHO IT'S FOR: three cards (55+ / after PT / for a parent) | |
| 4 | WHAT YOU CAN DO: Strength, Mobility, Balance photos + six use chips | |
| 5 | THE PEOPLE BEHIND IT: Eric and Reid (portrait slots), credentials, link to /our-story | |
| 6 | PROOF: verbatim reviews from content/reviews.ts, star summary, clinic + military testimonials featured | |
| 7 | FITS YOUR SPACE: parallax gallery of real installs, 3x3 ft note, link to /install | |
| 8 | PRICE + CTA: Standard vs XT, Board + Bands, shipping, discount, FAQ accordion, final CTA | |
| 9 | Product pages: /vary-board, /vary-board-xt, /resistance-bands (Product schema) | |
| 10 | /professionals (clinic benefits, 6-in-1, spec sheet slot, "Request clinic pricing / demo" form) | |
| 11 | /our-story, /install (video + steps slot), /faq (FAQPage schema), /contact | |
| 12 | /shipping, /warranty, /returns, /privacy, /terms, custom 404 | |
| 13 | SEO: per-page titles/descriptions, OG image, sitemap.xml, robots.txt | |
| 14 | Launch checklist run + HANDOFF.md | |

## Architecture

- `content/facts.ts` — single source of truth for every price, spec, contact detail and claim. Open facts carry `confirmed: false` and are never rendered until confirmed.
- `content/reviews.ts` — verbatim reviews pasted by Eric. Never written or edited by hand.
- `content/images.ts` — every image with descriptive alt text; `images.generated.ts` holds sizes + blur placeholders (built by `npm run assets:optimize`).
- `content/redirects.ts` — 301s from the old Shopify URLs, consumed by `next.config.ts`.
- `lib/commerce.ts` — Shopify cart permalinks. Buy buttons are plain links. No cart UI.
- `components/motion/MotionProvider.tsx` — motion mode: `full` (desktop), `light` (phones), `none` (prefers-reduced-motion). Every animated section reads this and renders its static layout first.
- `scripts/` — `fetch-assets.mjs` (download store photos), `optimize-images.mjs` (AVIF/WebP, responsive sizes, blur), `cutout.py` (rembg board cutouts), `check-placeholders.mjs` (launch gate).

## Hero

- `components/home/HeroCinematic.tsx`: the approved render (`public/images/originals/hero-render-clean.jpg`) full-bleed, anchored right so the boards stay in frame at every viewport. The art box reproduces object-fit cover with an exact aspect ratio, so the three callouts (positioned in image pixel space) stay locked to the boards.
- Intro: masked line reveal on the headline, staggered fade-ups, leader lines draw in, dots pop. Starts hidden only when JS is running and motion is allowed (`html[data-js]` set before first paint); a CSS safety animation reveals everything at 2.6s regardless.
- Scroll: scrubbed parallax on the art, slower drift on the copy, callouts fade out. Header is transparent over the hero and turns to paper on scroll.
- Reduced motion: everything static and visible. Phones: art panel on top, callouts hidden (pillars listed in the DOM instead), lighter parallax.

## Design

- Palette: warm paper (#f7f6f2), ink (#17211f), brand teal #85b5b2 as accent (chips, glows, borders), deep teal #1f5f5b for buttons (white text at 7:1 contrast).
- Type: Fraunces (display) + Inter (text). Base 18px, line-height 1.6.
- Tap targets 48px minimum. Pinch-zoom allowed. No layout shift: every image has intrinsic size + blur placeholder; motion is layered on after first paint.
- Motion: scroll-scrubbed only. No scroll-jacking. Lighter parallax on phones. Static under reduced motion.

## Section 2 approach (next up)

Pinned `WhatItIs` section (GSAP `pin: true`, scrub). Three copies of `public/images/cutouts/board-section.png` slide in and stack to a 75" board with a height ruler; then the camera zooms on the hex anchor points using the pool close-up photo; then the band-clipping detail. Captions: one idea per step. On phones the pin is replaced by a normal stacked layout with light fade-ins; under reduced motion it is a static three-panel layout.

## Known constraints

- The build environment could not reach thevaryboard.com or cdn.shopify.com. Run `npm run assets:fetch` locally to pull the rest of the store photos, then `npm run assets:optimize`.
- Source photos in the repo are 500-900 px wide. Fine for phones and contained frames; too soft for full-bleed desktop. Drop original-resolution files into `public/images/originals/` and re-run the optimize + cutout scripts.
