"use client";

import { useEffect, useRef, useState } from "react";

/**
 * HexShaderBackground: a slow, low-contrast honeycomb field drawn in WebGL.
 *
 * - `density` is the number of hexagon columns across the width (14 desktop, 10 phones).
 * - Renders at a capped pixel size (max 1280 x 720 device pixels), upscaled by CSS, so it
 *   stays cheap on phones.
 * - Mounts after first paint (idle callback) and fades in over 600 ms, so it never competes
 *   with the LCP image.
 * - prefers-reduced-motion: renders one static frame, no animation loop.
 * - Pauses when off-screen or when the tab is hidden.
 * - Zero dependencies.
 */
export interface HexShaderBackgroundProps {
  variant?: "dark" | "light";
  density?: number;
  className?: string;
}

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform float u_density;
uniform vec3 u_bg;
uniform vec3 u_line;
uniform vec3 u_glow;
uniform float u_static;

// Hexagonal tiling helpers (pointy-top hexagons).
const vec2 S = vec2(1.0, 1.7320508);
float hexDist(vec2 p){ p = abs(p); return max(dot(p, S * 0.5), p.x); }
vec4 hexCoords(vec2 uv){
  vec4 c = floor(vec4(uv, uv - vec2(0.5, 1.0)) / S.xyxy) + 0.5;
  vec4 h = vec4(uv - c.xy * S, uv - (c.zw + 0.5) * S);
  return dot(h.xy, h.xy) < dot(h.zw, h.zw) ? vec4(h.xy, c.xy) : vec4(h.zw, c.zw + 0.5);
}
float hash21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }

void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / u_res.y;                 // keep hexes regular
  uv *= u_density * (u_res.y / u_res.x);    // u_density columns across the width
  vec4 h = hexCoords(uv);
  float d = hexDist(h.xy);                  // 0 at centre, 0.5 at the edge
  float id = hash21(h.zw);
  float t = u_time * (1.0 - u_static);

  // Slow luminance drift per cell, plus a broad wave crossing the field.
  float pulse = 0.5 + 0.5 * sin(t * 0.35 + id * 6.2831);
  float wave = 0.5 + 0.5 * sin(uv.x * 0.9 - uv.y * 0.5 - t * 0.25);
  float cellLum = 0.035 + 0.045 * pulse * wave;

  // Thin edge line, soft inner falloff.
  float edge = smoothstep(0.5, 0.47, d) * smoothstep(0.43, 0.47, d);
  float inner = smoothstep(0.5, 0.0, d);

  // Vignette to the left so copy sits on the darkest ground.
  vec2 n = frag / u_res;
  float vig = smoothstep(0.0, 0.7, n.x) * (0.55 + 0.45 * smoothstep(0.0, 0.5, n.y));

  vec3 col = u_bg;
  col += u_glow * cellLum * inner * vig;
  col += u_line * edge * (0.10 + 0.12 * pulse) * vig;
  // Occasional brighter cell, very sparse.
  float spark = step(0.985, hash21(h.zw + floor(t * 0.05))) * inner * 0.06 * vig;
  col += u_glow * spark;
  gl_FragColor = vec4(col, 1.0);
}`;

export function HexShaderBackground({ variant = "dark", density = 14, className = "" }: HexShaderBackgroundProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let gl: WebGLRenderingContext | null = null;
    let raf = 0;
    let running = false;
    let visible = true;
    let disposed = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const start = () => {
      if (disposed) return;
      gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power", preserveDrawingBuffer: false });
      if (!gl) return; // no WebGL: the CSS background (#0b0c0e) simply stays
      const g = gl;
      const compile = (type: number, src: string) => {
        const sh = g.createShader(type)!;
        g.shaderSource(sh, src);
        g.compileShader(sh);
        return sh;
      };
      const prog = g.createProgram()!;
      g.attachShader(prog, compile(g.VERTEX_SHADER, VERT));
      g.attachShader(prog, compile(g.FRAGMENT_SHADER, FRAG));
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
      const dark = variant === "dark";
      g.uniform1f(U("u_density"), density);
      g.uniform3f(U("u_bg"), ...(dark ? [0.043, 0.047, 0.055] : [0.91, 0.898, 0.871]) as [number, number, number]);
      g.uniform3f(U("u_line"), 0.522, 0.71, 0.698); // mint #85b5b2
      g.uniform3f(U("u_glow"), 0.522, 0.71, 0.698);
      g.uniform1f(U("u_static"), reduce ? 1 : 0);

      const resize = () => {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const rect = canvas.getBoundingClientRect();
        // Pixel cap: at most 1280 x 720 device pixels.
        const scale = Math.min(1, 1280 / (rect.width * dpr), 720 / (rect.height * dpr));
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
      const frame = () => {
        raf = 0;
        if (disposed) return;
        g.uniform1f(uTime, (performance.now() - t0) / 1000);
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
        loop();
        const io = new IntersectionObserver(([e]) => ((visible = e.isIntersecting), loop()), { rootMargin: "100px" });
        io.observe(canvas);
        document.addEventListener("visibilitychange", loop);
        cleanupFns.push(() => io.disconnect(), () => document.removeEventListener("visibilitychange", loop));
      }
      const ro = new ResizeObserver(() => {
        resize();
        if (reduce || !running) frame();
      });
      ro.observe(canvas);
      cleanupFns.push(() => ro.disconnect());
    };

    const cleanupFns: (() => void)[] = [];
    // Mount after first paint so the LCP image is never contended.
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
  }, [variant, density]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{ width: "100%", height: "100%", display: "block", opacity: ready ? 1 : 0, transition: "opacity 600ms ease", background: variant === "dark" ? "#0b0c0e" : "#e8e5de" }}
    />
  );
}

export default HexShaderBackground;
