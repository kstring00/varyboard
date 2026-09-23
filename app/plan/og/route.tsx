import { ImageResponse } from "next/og";
import { GENRES, GENRE_ORDER } from "@/content/intake";
import { brand } from "@/content/facts";
import { buildPlan, parseIntake } from "@/lib/intake";

/** Social share image for a plan: the lit hexagon plus the reflect headline. */
export const runtime = "nodejs";

const R = 150;
const C = { x: 190, y: 190 };
const corner = (i: number) => {
  const a = (Math.PI / 180) * (60 * i - 120);
  return { x: C.x + R * Math.cos(a), y: C.y + R * Math.sin(a) };
};

export async function GET(req: Request) {
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
      <div style={{ width: 1200, height: 630, display: "flex", background: "#f2f0eb", color: "#17211f", fontFamily: "Georgia, serif", padding: 64, alignItems: "center" }}>
        <svg width="380" height="380" viewBox="0 0 380 380">
          <polygon points={GENRE_ORDER.map((_, i) => `${corner(i).x},${corner(i).y}`).join(" ")} fill="rgba(133,181,178,0.14)" />
          {GENRE_ORDER.map((g, i) => {
            const a = corner(i);
            const b = corner((i + 1) % 6);
            const lit = used.has(g);
            return <line key={g} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={lit ? "#4a8f8a" : "#cfd6d4"} strokeWidth={lit ? 14 : 8} strokeLinecap="round" />;
          })}
          {GENRE_ORDER.map((_, i) => (
            <circle key={i} cx={corner(i).x} cy={corner(i).y} r="9" fill="#24433f" />
          ))}
        </svg>
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 56, flex: 1 }}>
          <div style={{ fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: "#24433f", fontFamily: "Arial, sans-serif" }}>{`${brand.name} · Find your plan`}</div>
          <div style={{ fontSize: headline.length > 60 ? 44 : 54, lineHeight: 1.1, marginTop: 20, fontWeight: 500 }}>{headline}</div>
          <div style={{ fontSize: 26, marginTop: 24, color: "#3b4745", fontFamily: "Arial, sans-serif" }}>{sub}</div>
          <div style={{ display: "flex", gap: 14, marginTop: 28, flexWrap: "wrap" }}>
            {GENRE_ORDER.map((g) => (
              <div key={g} style={{ padding: "8px 16px", borderRadius: 999, fontSize: 20, fontFamily: "Arial, sans-serif", background: used.has(g) ? "#24433f" : "transparent", color: used.has(g) ? "#f2f0eb" : "#55615e", border: "2px solid " + (used.has(g) ? "#24433f" : "#cfd6d4") }}>
                {GENRES[g].label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
