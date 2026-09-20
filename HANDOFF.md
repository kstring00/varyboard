# Handoff

Plain-English guide to running thevaryboard.com. Fuller sections are added as each part of the site ships.

## Change a price, spec or contact detail

Everything lives in one file: `content/facts.ts`.

1. Open `content/facts.ts`.
2. Find the value (for example `products.board.price`) and change it.
3. Commit and push. Vercel rebuilds the site automatically.

Prices, SKUs, heights, phone number, email, shipping rate and the discount note are all read from that file. Nothing is typed into a page by hand.

### Facts that are still unconfirmed

Weight, depth, what "100 lb max capacity" means, colors, warranty and returns terms are in `openFacts` in the same file with `confirmed: false`. They do not appear anywhere on the site. To publish one, set `confirmed: true` and fill in `value`.

## Add a review

Open `content/reviews.ts` and add one entry to the `reviews` array, copied word for word from the review export. Set `featured: true` to show it on the home page. The star average is calculated from the array. Never edit a review's wording.

## Add a photo

1. Put the original, full-resolution file in `public/images/originals/`.
2. Run `npm run assets:optimize`.
3. Add a line in `content/images.ts` with descriptive alt text.

## Deploying on Vercel

The site is a standard Next.js project at the repo root. No build settings need changing.

1. In Vercel, **Add New Project**, import the `varyboard` GitHub repo. Framework is detected as Next.js.
2. Under **Settings > Environment Variables**, add for Production (and Preview):
   - `NEXT_PUBLIC_SHOP_DOMAIN` = the Shopify hostname that will serve checkout. See the note below. Production builds fail on purpose if this is missing.
   - `NEXT_PUBLIC_SITE_URL` = `https://thevaryboard.com` (optional, defaults to the Vercel production URL).
3. Deploy. Every push to `main` goes live; every pull request gets a preview URL. Previews send `noindex` so Google ignores them.

### Domains and the Shopify cutover

Today thevaryboard.com points at Shopify. After the switch it points at Vercel, and Shopify only runs checkout. Do it in this order so buy buttons never break:

1. In Shopify, note the store's `*.myshopify.com` address, or connect a subdomain such as `shop.thevaryboard.com` to Shopify (Shopify admin > Settings > Domains). That hostname becomes `NEXT_PUBLIC_SHOP_DOMAIN`.
2. Set that variable in Vercel and redeploy. Click a buy button on the preview and confirm the Shopify cart opens.
3. In Vercel **Settings > Domains**, add both `thevaryboard.com` and `www.thevaryboard.com`. Make `thevaryboard.com` primary; Vercel redirects `www` to it automatically. HTTPS certificates are issued automatically.
4. At the DNS provider, follow the records Vercel shows (an `A` record for the apex, a `CNAME` for `www`). Remove the old Shopify records for those two names.
5. In Shopify, set the new checkout hostname as the primary domain so checkout URLs and order emails use it.

Old Shopify URLs (`/products/vb`, `/pages/our-story`, `/cart/...` and so on) redirect with a 301 to the right place on the new site or to the Shopify store, so existing links and Google results keep working.

## Accounts that must be in Eric's name

- Domain registrar for thevaryboard.com
- Vercel project (hosting)
- GitHub repository (source code)
- Shopify store (checkout only)
- Google Search Console
- YouTube channel that hosts the product video
- The form/email service used by the contact and clinic forms (to be chosen when those pages ship)
