"use client";

import { useEffect, useRef, useState } from "react";

/**
 * HexShaderBackground: a slow honeycomb field drawn in WebGL.
 *
 * Light variant (the brand hero): large soft cells that ramp from plaster on the left to deep
 * mint pooling on the right, hairline light seams, a gentle bloom on the right, paper grain,
 * per-cell drift, and a soft cursor follow.
 *
 * - `density`: hexagon columns across the width.
 * - `intensity`: amplitude of the colour variation (0..1). `timeScale`: speed multiplier.
 * - `palette`: four colours, light to deep, as linear-ish RGB triplets in 0..1.
 * - Renders at a capped pixel size (max 1280 x 720 device px), upscaled by CSS.
 * - Mounts after first paint (idle callback), fades in over 600 ms.
 * - prefers-reduced-motion: one static frame. Pauses off-screen / hidden tab. Zero deps.
 */
export type RGB = [number, number, number];
export interface HexShaderBackgroundProps {
  variant?: "dark" | "light";
  density?: number;
  intensity?: number;
  timeScale?: number;
  palette?: [RGB, RGB, RGB, RGB];
  cursor?: boolean;
  className?: string;
}

const LIGHT_PALETTE: [RGB, RGB, RGB, RGB] = [
  [0.949, 0.941, 0.922], // plaster
  [0.855, 0.905, 0.895], // pale mint
  [0.62, 0.78, 0.765], // mint
  [0.4, 0.63, 0.615], // deep mint
];
const DARK_PALETTE: [RGB, RGB, RGB, RGB] = [
  [0.043, 0.047, 0.055],
  [0.07, 0.09, 0.095],
  [0.12, 0.18, 0.18],
  [0.2, 0.3, 0.3],
];

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_density;
uniform float u_intensity;
uniform vec2 u_mouse;      // 0..1, y up; (-1,-1) = none
uniform vec3 u_p0; uniform vec3 u_p1; uniform vec3 u_p2; uniform vec3 u_p3;
uniform float u_light;     // 1 = light variant

const vec2 S = vec2(1.0, 1.7320508);
float hexDist(vec2 p){ p = abs(p); return max(dot(p, S * 0.5), p.x); }
vec4 hexCoords(vec2 uv){
  vec4 c = floor(vec4(uv, uv - vec2(0.5, 1.0)) / S.xyxy) + 0.5;
  vec4 h = vec4(uv - c.xy * S, uv - (c.zw + 0.5) * S);
  return dot(h.xy, h.xy) < dot(h.zw, h.zw) ? vec4(h.xy, c.xy) : vec4(h.zw, c.zw + 0.5);
}
float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec3 palette(float f){
  f = clamp(f, 0.0, 1.0) * 3.0;
  if (f < 1.0) return mix(u_p0, u_p1, f);
  if (f < 2.0) return mix(u_p1, u_p2, f - 1.0);
  return mix(u_p2, u_p3, f - 2.0);
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 n = frag / u_res;                          // 0..1 screen
  float aspect = u_res.x / u_res.y;
  vec2 uv = (frag / u_res.y) * (u_density / aspect); // density columns across
  vec4 h = hexCoords(uv);
  float d = hexDist(h.xy);                        // 0 centre .. 0.5 edge
  float id = hash21(h.zw);
  float id2 = hash21(h.zw + 17.0);
  float t = u_time;

  // Per-cell slow drift and a broad travelling wave.
  float drift = sin(t * 0.6 + id * 6.2831) * 0.5 + 0.5;
  float wave = sin(uv.x * 0.55 - uv.y * 0.35 - t * 0.45 + id2 * 1.5) * 0.5 + 0.5;

  // Deep mint pools to the right, near-plaster on the left.
  float ramp = smoothstep(0.18, 0.95, n.x);
  ramp = pow(ramp, 1.25);
  float f = ramp * (0.55 + 0.45 * u_intensity) + (drift - 0.5) * 0.55 * u_intensity + (wave - 0.5) * 0.35 * u_intensity;
  f += (id2 - 0.5) * 0.28 * u_intensity;         // fixed per-cell variety
  f *= 0.35 + 0.65 * ramp;                        // keep the far left calm

  // Cursor follow: cells deepen a touch near the pointer.
  if (u_mouse.x >= 0.0) {
    vec2 dm = (n - u_mouse) * vec2(aspect, 1.0);
    f += 0.22 * u_intensity * smoothstep(0.42, 0.0, length(dm));
  }
  vec3 col = palette(f);

  // Frosted cell: lighter toward the rim.
  float rim = smoothstep(0.22, 0.5, d);
  col = mix(col, col + vec3(0.05), rim * 0.5);
  // Soft watercolour variation inside each cell.
  col += (hash21(floor(frag / 48.0) + h.zw) - 0.5) * 0.02;

  // Hairline light seam (about 1.3 px), stronger on the right.
  float px = fwidth(d) * 1.3;
  float seam = 1.0 - smoothstep(0.0, px, 0.5 - d);
  vec3 seamCol = u_light > 0.5 ? vec3(0.985, 0.98, 0.965) : vec3(0.35, 0.5, 0.49);
  col = mix(col, seamCol, seam * (0.22 + 0.4 * ramp));
  // Soft bloom around seams on the right.
  float bloom = smoothstep(0.4, 0.5, d) * ramp * 0.07;
  col += (u_light > 0.5 ? vec3(1.0) : vec3(0.5, 0.7, 0.69)) * bloom;

  // Paper grain.
  float g = hash21(frag + fract(t) * 13.7) - 0.5;
  col += g * 0.04;
  gl_FragColor = vec4(col, 1.0);
}`;

export function HexShaderBackground({ variant = "light", density = 12, intensity = 0.42, timeScale = 0.35, palette, cursor = true, className = "" }: HexShaderBackgroundProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const pal = palette ?? (variant === "light" ? LIGHT_PALETTE : DARK_PALETTE);
  const palKey = pal.flat().join(",");

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const p = palKey.split(",").map(Number);
    let gl: WebGLRenderingContext | null = null;
    let raf = 0;
    let running = false;
    let visible = true;
    let disposed = false;
    const cleanupFns: (() => void)[] = [];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mouse = { x: -1, y: -1, tx: -1, ty: -1 };

    const start = () => {
      if (disposed) return;
      gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
      if (!gl) return; // no WebGL: the CSS background stays
      const g = gl;
      g.getExtension("OES_standard_derivatives");
      const compile = (type: number, src: string) => {
        const sh = g.createShader(type)!;
        g.shaderSource(sh, src);
        g.compileShader(sh);
        return sh;
      };
      const prog = g.createProgram()!;
      g.attachShader(prog, compile(g.VERTEX_SHADER, VERT));
      g.attachShader(prog, compile(g.FRAGMENT_SHADER, "#extension GL_OES_standard_derivatives : enable\n" + FRAG));
      g.linkProgram(prog);
      if (!g.getProgramParameter(prog, g.LINK_STATUS)) return;
      g.useProgram(prog);
      const buf = g.createBuffer();
      g.bindBuffer(g.ARRAY_BUFFER, buf);
      g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), g.STATIC_DRAW);
      const loc = g.getAttribLocation(prog, "p");
      g.enableVertexAttribArray(loc);
      g.vertexAttribPointer(loc, 2, g.FLOAT, false, 0, 0);
      const U = (n: string) => g.getUniformLocation(prog, n);
      const uRes = U("u_res");
      const uTime = U("u_time");
      const uMouse = U("u_mouse");
      g.uniform1f(U("u_density"), density);
      g.uniform1f(U("u_intensity"), intensity);
      g.uniform1f(U("u_light"), variant === "light" ? 1 : 0);
      g.uniform3f(U("u_p0"), p[0], p[1], p[2]);
      g.uniform3f(U("u_p1"), p[3], p[4], p[5]);
      g.uniform3f(U("u_p2"), p[6], p[7], p[8]);
      g.uniform3f(U("u_p3"), p[9], p[10], p[11]);
      g.uniform2f(uMouse, -1, -1);

      const resize = () => {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const rect = canvas.getBoundingClientRect();
        // Pixel cap: 1280x720 device px on desktop, 720x405 on phones. The field is soft, so the upscale is invisible.
        const small = window.matchMedia("(max-width: 768px)").matches;
        const capW = small ? 720 : 1280;
        const capH = small ? 405 : 720;
        const scale = Math.min(1, capW / (rect.width * dpr), capH / (rect.height * dpr));
        const w = Math.max(1, Math.round(rect.width * dpr * scale));
        const h = Math.max(1, Math.round(rect.height * dpr * scale));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        g.viewport(0, 0, w, h);
        g.uniform2f(uRes, w, h);
      };
      const t0 = performance.now();
      let last = 0;
      const frame = (now = performance.now()) => {
        raf = 0;
        if (disposed) return;
        // 30 fps is plenty for a slow drift and halves the GPU/CPU work.
        if (running && !reduce && now - last < 33) {
          raf = requestAnimationFrame(frame);
          return;
        }
        last = now;
        if (mouse.tx >= 0) {
          mouse.x = mouse.x < 0 ? mouse.tx : mouse.x + (mouse.tx - mouse.x) * 0.08;
          mouse.y = mouse.y < 0 ? mouse.ty : mouse.y + (mouse.ty - mouse.y) * 0.08;
          g.uniform2f(uMouse, mouse.x, mouse.y);
        }
        g.uniform1f(uTime, ((performance.now() - t0) / 1000) * timeScale);
        g.drawArrays(g.TRIANGLES, 0, 3);
        if (running && !reduce) raf = requestAnimationFrame(frame);
      };
      const loop = () => {
        running = visible && !document.hidden;
        if (running && !raf) raf = requestAnimationFrame(frame);
      };
      resize();
      frame();
      setReady(true);
      if (!reduce) {
        // First frame is static; the drift starts after the page has settled.
        const kick = window.setTimeout(loop, 1500);
        cleanupFns.push(() => window.clearTimeout(kick));
        const io = new IntersectionObserver(([e]) => ((visible = e.isIntersecting), loop()), { rootMargin: "100px" });
        io.observe(canvas);
        document.addEventListener("visibilitychange", loop);
        cleanupFns.push(() => io.disconnect(), () => document.removeEventListener("visibilitychange", loop));
        if (cursor) {
          const host = canvas.parentElement ?? canvas;
          const onMove = (e: PointerEvent) => {
            if (e.pointerType !== "mouse") return;
            const r = canvas.getBoundingClientRect();
            mouse.tx = (e.clientX - r.left) / r.width;
            mouse.ty = 1 - (e.clientY - r.top) / r.height;
          };
          host.addEventListener("pointermove", onMove, { passive: true });
          cleanupFns.push(() => host.removeEventListener("pointermove", onMove));
        }
      }
      const ro = new ResizeObserver(() => {
        resize();
        if (reduce || !running) frame();
      });
      ro.observe(canvas);
      cleanupFns.push(() => ro.disconnect());
    };

    const hasIdle = "requestIdleCallback" in window;
    const id = hasIdle ? window.requestIdleCallback(start, { timeout: 800 }) : window.setTimeout(start, 150);
    return () => {
      disposed = true;
      running = false;
      if (hasIdle) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
      if (raf) cancelAnimationFrame(raf);
      cleanupFns.forEach((f) => f());
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [variant, density, intensity, timeScale, palKey, cursor]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{ width: "100%", height: "100%", display: "block", opacity: ready ? 1 : 0, transition: "opacity 600ms ease", background: variant === "dark" ? "#0b0c0e" : "#f2f0eb" }}
    />
  );
}

export default HexShaderBackground;
