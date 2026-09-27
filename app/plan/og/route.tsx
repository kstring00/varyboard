import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { GENRES, GENRE_ORDER } from "@/content/intake";
import { brand } from "@/content/facts";
import { COLORS } from "@/lib/colors";
import { buildPlan, parseIntake } from "@/lib/intake";

/** Social share image for a plan: the lit hexagon plus the reflect headline. */
export const runtime = "nodejs";

const R = 150;
const C = { x: 190, y: 190 };
const corner = (i: number) => {
  const a = (Math.PI / 180) * (60 * i - 120);
  return { x: C.x + R * Math.cos(a), y: C.y + R * Math.sin(a) };
};

/** The site's one family, Figtree (SIL OFL; assets/fonts), since next/font's CSS variables do not reach the image renderer. */
const FONT = (w: number) => readFile(join(process.cwd(), `assets/fonts/Figtree-${w}.ttf`));

export async function GET(req: Request) {
  const [regular, semibold] = await Promise.all([FONT(400), FONT(600)]);
  const sp = Object.fromEntries(new URL(req.url).searchParams.entries());
  const parsed = parseIntake(sp, true);
  let headline = "Find your plan";
  let genres = GENRE_ORDER;
  let sub = "Three quick questions. A ten-minute plan.";
  if (!("redirect" in parsed) && parsed.step === 4) {
    const { lane, concern, situation, area } = parsed.state;
    const plan = buildPlan(lane, concern.key, situation?.key, area);
    headline = plan.reflect.headline;
    genres = plan.genres;
    sub = `Your plan uses ${plan.genres.length} of the 6 kinds of practice`;
  }
  const used = new Set(genres);
  return new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", background: COLORS.bg, color: COLORS.ink, fontFamily: "Figtree", padding: 64, alignItems: "center" }}>
        <svg width="380" height="380" viewBox="0 0 380 380">
          <polygon points={GENRE_ORDER.map((_, i) => `${corner(i).x},${corner(i).y}`).join(" ")} fill="rgba(98,187,166,0.14)" />
          {GENRE_ORDER.map((g, i) => {
            const a = corner(i);
            const b = corner((i + 1) % 6);
            const lit = used.has(g);
            return <line key={g} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={lit ? COLORS.progress : COLORS.lineCool} strokeWidth={lit ? 14 : 8} strokeLinecap="round" />;
          })}
          {GENRE_ORDER.map((_, i) => (
            <circle key={i} cx={corner(i).x} cy={corner(i).y} r="9" fill={COLORS.brand} />
          ))}
        </svg>
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 56, flex: 1 }}>
          <div style={{ fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: COLORS.brand, fontWeight: 600 }}>{`${brand.name} · Find your plan`}</div>
          <div style={{ fontSize: headline.length > 60 ? 44 : 54, lineHeight: 1.1, marginTop: 20, fontWeight: 600, letterSpacing: "-0.035em" }}>{headline}</div>
          <div style={{ fontSize: 26, marginTop: 24, color: COLORS.ink2 }}>{sub}</div>
          <div style={{ display: "flex", gap: 14, marginTop: 28, flexWrap: "wrap" }}>
            {GENRE_ORDER.map((g) => (
              <div key={g} style={{ padding: "8px 16px", borderRadius: 999, fontSize: 20, background: used.has(g) ? COLORS.brand : "transparent", color: used.has(g) ? COLORS.bg : COLORS.ink3, border: "2px solid " + (used.has(g) ? COLORS.brand : COLORS.lineCool) }}>
                {GENRES[g].label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Figtree", data: regular, weight: 400, style: "normal" },
        { name: "Figtree", data: semibold, weight: 600, style: "normal" },
      ],
    },
  );
}
