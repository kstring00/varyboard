# Handoff

Plain-English guide to running thevaryboard.com. The site is a Next.js app on Vercel. Shopify is used only for checkout.

## Change a price, spec or contact detail

Everything lives in one file: `content/facts.ts`.

1. Open `content/facts.ts`.
2. Find the value (for example `products.board.price`) and change it.
3. Commit and push to `main`. Vercel rebuilds the site automatically in about two minutes.

Prices, SKUs, heights, the phone number, email, shipping rate, the discount note, founder credentials and bios are all read from that file. Nothing is typed into a page by hand. The FAQ (`content/faq.ts`) builds its answers from the same values.

### Facts that are still unconfirmed

Weight, depth, what "100 lb max capacity" means, colors, warranty terms and returns terms are in `openFacts` in `content/facts.ts` with `confirmed: false`. They do not appear anywhere on the site. To publish one, set `confirmed: true` and fill in `value`. The warranty and returns pages show the terms automatically once they are confirmed.

## Add a review

Open `content/reviews.ts` and add one entry to the `reviews` array, copied word for word from the review export:

```ts
{ id: "r-001", author: "Jane D.", rating: 5, date: "2026-03-14", body: "…exact text…", context: "Physical therapy clinic", verified: true, featured: true },
```

The home page "What people say" section appears as soon as the array has one entry. The star average is calculated from the array. Reviews whose `context` mentions a clinic or the military are shown first. Never edit a review's wording.

## Add the founder portraits

Save the photos as `public/images/founders/eric-santiago.jpg` and `public/images/founders/reid-de-leon.jpg` (portrait orientation, at least 800 px wide). The home page and the story page pick them up automatically; until then they show initials.

## Add a photo

1. Put the original, full-resolution file in `public/images/originals/`.
2. Run `npm run assets:optimize`.
3. Add a line in `content/images.ts` with descriptive alt text.

To pull the remaining photos from the old Shopify store, run `npm run assets:fetch` on a computer that can reach thevaryboard.com, then the two steps above.

## Change the hero image

The home page hero uses `public/images/originals/hero-render-clean.jpg`. Replace that file with a new one of the same framing, run `npm run assets:optimize` and `npm run assets:og`, and update the alt text for `heroRender` in `content/images.ts`. The three callout dots are positioned in image pixels at the top of `components/home/HeroCinematic.tsx`; adjust them if the boards move.

## Add the install steps and the spec sheet

- Written install steps: add entries to `content/install.ts`. The install page shows them under the video once there is at least one.
- Clinic spec sheet: save the PDF as `public/downloads/vary-board-spec-sheet.pdf`. The download button on the professionals page appears automatically.

## Forms (contact and clinic requests)

Both forms post to a small server function (`app/actions/forms.ts`) with spam protection. Set ONE of these in Vercel > Project > Settings > Environment Variables so messages reach you:

- `FORM_WEBHOOK_URL`: any service that accepts a JSON POST (Formspree, Zapier, Make, n8n). Simplest option.
- `RESEND_API_KEY` plus `FORM_FROM_EMAIL`: sends an email to info@varysystems.com through Resend.

Until one is set, the form tells the visitor it could not send and shows the phone number and email instead. Test after setting it: send a message from /contact and confirm it arrives.

## Deploying on Vercel

1. Vercel > Add New Project > import the `varyboard` GitHub repo. Framework is detected as Next.js. No settings need changing.
2. Environment variables (Production, and Preview if you like):
   - `NEXT_PUBLIC_SHOP_DOMAIN`: the Shopify hostname that serves checkout. See the cutover note below. Can stay unset while thevaryboard.com still points at Shopify; required once the domain moves. The build fails on purpose if the checkout host would be the site itself.
   - `NEXT_PUBLIC_SITE_URL`: `https://thevaryboard.com` (optional, defaults to the Vercel production URL).
   - One of the form variables above.
3. Every push to `main` goes live; every pull request gets a preview URL. Previews send `noindex`.

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
| What / who / why clear in 5 s; one dominant CTA per page | Yes: hero headline, sub-line, three pillars, "Get the Vary Board ($199)" |
| Phone tappable on every page | Yes: header and footer `tel:` links on all 15 routes |
| Real-phone mobile check | 390 px emulation: no horizontal overflow on any route, 18 px base type, 48 px tap targets |
| Images compressed and sized | AVIF/WebP via next/image plus pre-generated sets; hero LCP image preloaded |
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
