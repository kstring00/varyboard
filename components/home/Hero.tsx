import { existsSync } from "node:fs";
import path from "node:path";
import { Hero3D } from "./hero3d/Hero3D";

/**
 * HERO. Real-time 3D scene of the actual board (procedural, or /public/models/varyboard.glb
 * when a real model is supplied). Reduced-motion, no-WebGL and low-power devices get the
 * same layout with a real photo instead of the scene. HeroStatic.tsx is the earlier photo
 * hero and is kept for reference / A-B use.
 */
export function Hero() {
  const glb = path.join(process.cwd(), "public", "models", "varyboard.glb");
  const modelUrl = existsSync(glb) ? "/models/varyboard.glb" : null;
  return <Hero3D modelUrl={modelUrl} />;
}
