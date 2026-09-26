# Handoff

Plain-English guide to running thevaryboard.com. The site is a Next.js app on Vercel. Shopify is used only for checkout.

## Launch blockers (do these in order, before thevaryboard.com moves to Vercel)

Status on 2026-09-24: thevaryboard.com and www.thevaryboard.com still point at Shopify (`23.227.38.32` and `shops.myshopify.com`). The Vercel project serves only its own `*.vercel.app` URLs.

1. **`vercel-build` must run the content gate before the domain moves to Vercel.** Today it is plain `next build`, which skips every check in `prebuild` (placeholders, safety, intake, content review). Change it to `"vercel-build": "npm run build"` (or set Vercel's Build Command to `npm run build`). Not enabled yet on purpose: with Eric's review list open, every production deploy would fail.
2. Eric works through `content/review.csv` until `npm run audit:content` prints "every content item is reviewed", including the open review question (J. White, fall-risk wording).
3. `NEXT_PUBLIC_SHOP_DOMAIN` set to the Shopify checkout host (see "Domains and the Shopify cutover").
4. Move the domain (same section), then set `SITE_LAUNCHED=true` for Production and redeploy. That lifts the noindex on production only; previews stay noindex.
5. Submit the sitemap (see "After launch").

## Pre-launch noindex

The site is open to anyone with a link, but nothing is indexed until launch. Until `SITE_LAUNCHED=true` on production: `robots.txt` disallows everything, every page carries `<meta name="robots" content="noindex, nofollow">`, and every response carries `X-Robots-Tag: noindex, nofollow, noarchive` (`proxy.ts`). Previews never index, launched or not.

## Change a price, spec or contact detail

Everything lives in one file: `content/facts.ts`.

1. Open `content/facts.ts`.
2. Find the value (for example `products.board.price`) and change it.
3. Commit and push to `main`. Vercel rebuilds the site automatically in about two minutes.

Prices, SKUs, heights, the phone number, email, shipping rate, the discount note, founder credentials and bios are all read from that file. Nothing is typed into a page by hand. The FAQ (`content/faq.ts`) builds its answers from the same values.

### Facts that are still unconfirmed

Weight, depth, what "100 lb max capacity" means, colors, warranty terms and returns terms are in `openFacts` in `content/facts.ts` with `confirmed: false`. They do not appear anywhere on the site. To publish one, set `confirmed: true` and fill in `value`. The warranty and returns pages show the terms automatically once they are confirmed.

## Add a review

Open `content/reviews.ts` and add one entry to the `reviews` array, copied word for word:

```ts
{ id: "jane-d", author: "Jane D.", body: "…exact text…", excerpt: "A short part of the exact text.", lane: "Home", label: "Home user", initials: "JD", featured: true },
```

- **`excerpt`** is the short quote in the homepage band. It must appear exactly inside `body`; it may start or end with "…". The build fails if it does not. Never edit a review's wording to make it pass.
- **`lane`** is `"Military"`, `"Clinic"` or `"Home"`; plan pages pick a review from the matching lane. **`label`** is one short line from the reviewer's own words. `focal: true` makes one featured review the deep-teal hexagon.
- **`featured: true`** puts the review in the homepage band ("In their words", `#reviews`, above pricing), in file order.
- `listOnly: true` keeps a review out of every featured placement. J. White's review is list-only and not featured until Eric answers "keep or remove? (fall-risk wording)" on his review list (`ericQuestion`; in the CSV, Y means keep; removing means deleting the entry).
- Stars per review appear only when a review has a `rating`, which the Shopify review sync will supply. The store-wide "47 ★★★★★ reviews on the Vary Board store" comes from `content/facts.ts` (`storeReviews`). **[VERIFY]** confirm 47 and 5.0 against the Shopify reviews app before launch.
- "Read all 47 reviews" goes to the Shopify product page (`reviewsUrl` in `content/config.ts`) until the review sync adds `/reviews`.
- The band's last cell links to `/contact?topic=story`, which preselects "Share my story" in the contact form.

## Add the founder portraits

Save the photos as `public/images/founders/eric-santiago.jpg` and `public/images/founders/reid-de-leon.jpg` (portrait orientation, at least 800 px wide). The home page and the story page pick them up automatically; until then they show initials.

## Add a photo

1. Put the original, full-resolution file in `public/images/originals/`.
2. Run `npm run assets:optimize`.
3. Add a line in `content/images.ts` with descriptive alt text.

To pull the remaining photos from the old Shopify store, run `npm run assets:fetch` on a computer that can reach thevaryboard.com, then the two steps above.

## The homepage hero (scroll-build)

The hero is a scroll-driven drawing of the Vary Board being built on an empty wall, ported from `reference/varyboard-scroll-build.html`: the hook ("The appointment ends. Your recovery doesn't."), three published findings, the 3 × 3 ft space, "For those who served", the program with Blake Cook's quote, and the finale (the six ways, one "Find your plan" button, the VA line).

- **Copy and statistics:** `content/hero.ts`, in beat order. Every statistic names its source (`content/sources.ts`) and every statistic, caption and health line is `rv("…")` until Eric approves it. Specs and prices come from `content/facts.ts` through `{tokens}`: `{spaceFeet}`, `{depth}`, `{price}`. Blake Cook's quote is read from `content/reviews.ts`, never retyped. The review count is `storeReviews` in `content/facts.ts` ([VERIFY]).
- **VA wording** is fixed: "may be covered when your provider finds it medically necessary." The build fails if a VA line loses it or says "free" (`checkCoverage` in `content/hero.ts`).
- **The drawing** (`components/home/hero/BoardSvg.tsx`) is on spec: 25 × 8 × 3 in sections, 47 anchors each, 141 in all. The figures are placeholder mannequins, not people. `TODO(real-cutouts)`: swap the drawing for cutouts of the real board photographed flat. `npm run check:placeholders` lists this TODO on every run and fails on any other.
- **Motion:** `components/home/hero/choreography.ts`, scroll only, no libraries. The timeline mapping (`KN`), poses and the board's geometry are in `rig.ts`. With reduced motion the finale is drawn once and nothing is pinned.
- **Links:** "Get the provider packet" opens `public/docs/va-provider-packet.pdf` once it exists and the military plan (`/plan?for=mil`) until then. The six hexagons open their cards in "What you can do" (`#genre-climb` …).

## Add the install steps and the spec sheet

- Written install steps: add entries to `content/install.ts`. The install page shows them under the video once there is at least one.
- Clinic spec sheet: save the PDF as `public/downloads/vary-board-spec-sheet.pdf`. The download button on the professionals page appears automatically.

## Find your plan (the intake at /plan)

Three one-tap questions (`for`, `c`, `s` or `area` in the URL) lead to `/plan/result`, a shareable plan page. All copy is in `content/intake.ts`; movements come from `content/exercises.ts`; the logic is `lib/intake.ts`.

- `npm run audit:content` lists every line Eric has not reviewed (`reviewedByEric: false` in intake.ts, `approved: false` in exercises.ts). It fails **production** builds only. Preview builds deploy and show a yellow "Draft, not reviewed by Eric" banner on any affected page. Flip the flags to `true` as Eric signs each item off.
- `npm run audit:safety` fails every build on diagnosis, cure, guarantee, "free" near VA, lifespan claims, or a statistic without a `source`.
- `npm run check:intake` fails every build if any valid combination lacks content.
- Comeback / recovery plans ask "My doctor or PT has cleared me to exercise" on the page, every time it opens. It is never stored in the link.
- `content/config.ts` holds the military discount mechanism (currently `unknown`, so the mil lane shows the phone number), the VA packet PDF slot (`public/docs/va-provider-packet.pdf`) and the email provider note. Prices stay in `content/facts.ts`; see `priceCandidates` there for the two figures to confirm.
- "Email me my plan" needs `RESEND_API_KEY` (Resend, under Eric's account) plus `FORM_FROM_EMAIL`, or `FORM_WEBHOOK_URL`. The plan is sent to the visitor with a copy to info@.
- **Eric's review round trip.** `npm run review:export` writes every unreviewed line to `content/review.csv` (columns: id, lane, type, current text, approve (Y/N), Eric's edit). Eric puts Y in the approve column and any rewording in the last column, keeping the `{you}` `{your}` `{my}` `{I}` tokens. `npm run review:import` writes it back: approved rows get `reviewedByEric: true` (exercises get `approved: true`) and edits replace the text in place. "try today" rows share one flag per movement, so all of that movement's rows need Y. Exercise rows carry the name only; other exercise fields are edited in `content/exercises.ts`. After importing run `npm run check:intake && npm run audit:safety && npm run audit:content`, then commit both the content files and the regenerated CSV.
- Blake Cook's testimonial: paste it into `content/reviews.ts` with `context: "Veteran"` (or similar) and the mil lane's plan page shows it automatically.

## Will it fit? (the room planner at /fit and on the homepage)

A three.js room planner ported from the client's prototype (kept at `reference/room-planner.html`, which the tests compare against). Drag the board to any wall of four rooms drawn to scale; the panel says whether it fits and why.

- **Two settings to confirm with Eric** in `content/config.ts` (`fitPlanner`): `mountMethod` ("studs" = snaps to studs 16 in apart, copy and stud lines say so; "any" = a 4 in grid and the stud copy disappears) and `mountBottomIn` (2 in above the floor today). Board sizes come from `content/facts.ts` (`sections`, `heightIn`, `board.section`).
- Rules are pure functions in `lib/fit.ts`; rooms and furniture are data in `content/rooms.ts`; the 3D scene is `components/fit/scene.ts`. `npm test` checks every room x board x wall x stud against the prototype (fixture from `npm run fit:fixture`).
- three.js never ships with the page. The section shows a real still of the bedroom scene (`public/images/fit/poster-bedroom.jpg`) until the visitor taps; the chunk is prefetched when the section is within 400px. Browsers without WebGL get the still plus a written room-by-room summary.
- To refresh the still after changing the bedroom or the board: run the site, then `node scripts/fit-poster.mjs` (Chromium with software GL; the script header says how).

## Homepage sections, in order

Hero (scroll-build) → Why it's different → What you can do → Who it's for → Find your plan → Will it fit? → The people behind it → Fits your space → In their words → Pricing.

- **Why it's different** (`#clinic`, `content/clinic.ts`): the usual PT gym next to one wall, an illustration of one day of sessions (the page says it is not measured data). One CTA: the clinic request form (`/professionals#request`). The page's **Sources** list sits at the bottom of this section, from `content/sources.ts`.
- **Genres** live in `content/genres.ts` (single source; the intake, hero and plan hexagon read from it). Clinical names are Eric's wording. Every health line is `rv("…")` and unreviewed until Eric signs it off. Anchor counts come from `content/facts.ts` through `{anchors}`-style tokens. Loosen (Joint Mobilizations) has no movements yet: its card shows "Coming soon from Dr. Eric" until the four fields are filled.
- **Who it's for** (`content/audiences.ts`): the DoD & VA block first, with "I'm a veteran →" (the military plan) and "I'm a VA clinician →" (the clinic request form until a VA clinician page exists), then three slim cards. "Outfit your team" opens the team inquiry form in the athletes card (`/#team-pricing` from anywhere).
- `npm run audit:content`, the Draft banner and `npm run review:export` / `review:import` cover the hero, clinic, genre and audience files.
- **Reviews** (`content/reviews.ts`): testimonials copied word for word. They carry no star rating or date because the source shows none, so no per-review stars render (Blake Cook's quote in the hero included) until a rating is added from the Shopify reviews app.

### Files Eric edits for copy and statistics

| What | File |
|---|---|
| Hero copy, six of the seven study statistics and their captions, the demo moves | `content/hero.ts` |
| The seventh statistic (Sherrington, falls) | `content/audiences.ts` |
| Citations and links | `content/sources.ts` |
| Why it's different | `content/clinic.ts` |
| Who it's for | `content/audiences.ts` |
| The six genres | `content/genres.ts` |
| Prices, specs, review count | `content/facts.ts` |
| All of the above, as a spreadsheet | `content/review.csv` (`npm run review:export`, then `review:import`) |

## Content gate on Vercel

`npm run build` runs the gates (placeholders, safety, intake, content). Vercel runs `vercel-build`, which is plain `next build`, so none of them run on Vercel today. Turning them on is launch blocker 1 above.

## Footer

Brand + utility: honeycomb top edge, "VARY BOARD" built from hexagons (decorative, `aria-hidden`; one line on wide screens, VARY over BOARD under 760px), utility columns, legal row. Every footer link comes from `content/routes.ts` (`footerNav`, `legalNav`); the phone, email, city and social accounts come from `content/facts.ts` (`brand`). `/accessibility` is a short statement page linked from the legal row.

- **Confirm the social URLs** in `content/facts.ts` (`brand.social`): they were taken from the footer mockup, not re-checked against the live site.
- "Military & VA" opens the intake's military lane (`/plan?for=mil`); "Team pricing" opens the clinic request form (`/professionals#request`). Repoint them in `content/routes.ts` if dedicated pages ship.

## Forms (contact and clinic requests)

Both forms post to a small server function (`app/actions/forms.ts`) with spam protection. Set ONE of these in Vercel > Project > Settings > Environment Variables so messages reach you:

- `FORM_WEBHOOK_URL`: any service that accepts a JSON POST (Formspree, Zapier, Make, n8n). Simplest option.
- `RESEND_API_KEY` plus `FORM_FROM_EMAIL`: sends an email through Resend (the account should be Eric's; the key lives only in Vercel env vars). Contact and clinic messages go to info@varysystems.com; "Email me my plan" goes to the visitor with a copy to info@.

Until one is set, the form tells the visitor it could not send and shows the phone number and email instead. Test after setting it: send a message from /contact and confirm it arrives.

## Deploying on Vercel

1. Vercel > Add New Project > import the `varyboard` GitHub repo. Framework is detected as Next.js. No settings need changing.
2. Environment variables (Production, and Preview if you like):
   - `NEXT_PUBLIC_SHOP_DOMAIN`: the Shopify hostname that serves checkout. See the cutover note below. Can stay unset while thevaryboard.com still points at Shopify; required once the domain moves. The build fails on purpose if the checkout host would be the site itself.
   - `NEXT_PUBLIC_SITE_URL`: `https://thevaryboard.com` (optional, defaults to the Vercel production URL).
   - One of the form variables above.
   - `SITE_LAUNCHED`: leave unset until launch day, then `true` for Production only.
3. Every push to `main` goes live on the production URL; every pull request gets a preview URL. Nothing is indexed until launch.

### Domains and the Shopify cutover

Today thevaryboard.com points at Shopify. After the switch it points at Vercel, and Shopify only runs checkout. In this order:

1. In Shopify (Settings > Domains), note the store's `*.myshopify.com` address, or connect a subdomain such as `shop.thevaryboard.com` to Shopify. That hostname becomes `NEXT_PUBLIC_SHOP_DOMAIN`.
2. Set the variable in Vercel and redeploy. Click a buy button on the preview and confirm the Shopify cart opens.
3. In Vercel > Settings > Domains add `thevaryboard.com` and `www.thevaryboard.com`. Make `thevaryboard.com` primary; Vercel redirects `www` to it and issues HTTPS certificates automatically.
4. At the DNS provider, add the records Vercel shows (an `A` record for the apex, a `CNAME` for `www`) and remove the old Shopify records for those two names.
5. In Shopify, set the new checkout hostname as the primary domain so checkout URLs and order emails use it.

Old Shopify URLs (`/products/vb`, `/pages/our-story`, `/cart/...` and so on) redirect with a 301 to the right place, so existing links and Google results keep working. The list is in `content/redirects.ts`.

## After launch

- Google Search Console: add thevaryboard.com and submit `https://thevaryboard.com/sitemap.xml`.
- Check the forms once more on the live domain.
- Policy pages (`/privacy`, `/terms`) are plain-English drafts; have them reviewed before relying on them legally.

## Accounts that must be in Eric's name

- Domain registrar for thevaryboard.com (DNS)
- Vercel account and project (hosting)
- GitHub organization or account that owns the `varyboard` repository (source code)
- Shopify store (checkout, orders, payments)
- Google Search Console property
- YouTube channel that hosts the product video
- The form delivery service (Formspree/Zapier/Make or Resend)

## Launch checklist (verified 2026-09-20 on the build in this repository)

| Check | Result |
|---|---|
| What / who / why clear in 5 s; one dominant CTA per page | Yes: "One wall. Six ways to move better.", the six genres, the 3 × 3 ft subhead, "Find your plan" |
| Phone tappable on every page | Yes: header and footer `tel:` links on all 15 routes |
| Real-phone mobile check | 390 px emulation: no horizontal overflow on any route, 18 px base type, 48 px tap targets |
| Images compressed and sized | AVIF/WebP via next/image plus pre-generated sets; the hero is drawn in SVG (no image) |
| Lighthouse mobile performance | Home 87, product 92, professionals 93 (accessibility 96, best practices 100) |
| Real founder photo | Slots ready; initials shown until the files are added (see above) |
| Testimonials | Section built; hidden until real reviews are pasted |
| Credentials, privacy link, current year, zero placeholder text | Yes; `npm run check:placeholders` passes |
| Unique title and description per page, one H1, alt text everywhere | Yes on all 15 routes (audited) |
| Favicon, OG image, sitemap.xml, robots.txt | Yes (`/icon.svg`, `/og.jpg`, 14 URLs in the sitemap; robots allows only in production) |
| Forms tested end to end | Yes: validation errors, then contact and clinic submissions delivered to a webhook |
| Every link clicked; 404 works | All internal links return 200; custom 404 returns status 404 |
| 301 redirects from old URLs | 15 old paths verified |
| HTTPS, www and non-www | Done in Vercel Domains at cutover (see above) |
