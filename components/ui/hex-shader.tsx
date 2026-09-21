"use client"

// HexShaderBackground — drifting metaballs rendered as a honeycomb.
// One WebGL canvas that fills its parent. Zero dependencies.
// Usage: <div className="relative"><HexShaderBackground className="absolute inset-0" /> …</div>
//
// The render loop runs CONTINUOUSLY while the canvas is on screen and the tab is
// visible. It only stops for reduced-motion (one static frame) or when off-screen.

import { useEffect, useRef } from "react"

export type HexShaderVariant = "dark" | "light"

export interface HexShaderProps {
  variant?: HexShaderVariant
  /** cells across the short axis; 14 desktop, ~10 mobile */
  density?: number
  /** blob size / strength, 0.2–0.6 */
  intensity?: number
  /** animation speed multiplier; 1 = demo speed */
  timeScale?: number
  /** follow the pointer with an extra blob */
  cursor?: boolean
  className?: string
}

const VERT = `attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.,1.);}`

const FRAG = `precision highp float;
uniform vec3 u_colors[4];
uniform vec4 u_scene;   // res.xy, time, unused
uniform vec4 u_shape;   // scale, intensity, paramA, density
uniform vec4 u_cursor;  // presence, x, y, radius
uniform float u_seed;
#define u_res u_scene.xy
#define u_time u_scene.z
float hash21(vec2 p){p=fract(p*vec2(234.34,435.345));p+=dot(p,p+34.23);return fract(p.x*p.y);}
vec3 palette(float x){float f=clamp(x,0.,1.)*3.;vec3 c=u_colors[0];
 c=mix(c,u_colors[1],smoothstep(0.,1.,clamp(f,0.,1.)));
 c=mix(c,u_colors[2],smoothstep(0.,1.,clamp(f-1.,0.,1.)));
 c=mix(c,u_colors[3],smoothstep(0.,1.,clamp(f-2.,0.,1.)));return c;}
// Pointy-top hex tiling: .xy cell id, .zw local coords. Cell radius (center to flat edge) = 0.5.
vec4 hexCoords(vec2 p){const vec2 r=vec2(1.,1.7320508);vec2 h=r*.5;vec2 a=mod(p,r)-h;vec2 b=mod(p-h,r)-h;vec2 gv=dot(a,a)<dot(b,b)?a:b;return vec4(p-gv,gv);}
float hexDist(vec2 p){p=abs(p);return max(dot(p,normalize(vec2(1.,1.7320508))),p.x);}
vec3 shade(vec2 p,float t){
 float k=u_shape.w;
 vec4 hc=hexCoords(p*k);
 vec2 cc=hc.xy/k;                       // cell center: the field is sampled ONCE per cell
 float field=0.;
 for(int i=0;i<7;i++){float fi=float(i);
  vec2 c=vec2(sin(t*(.19+fi*.037)+fi*2.1+u_seed),cos(t*(.16+fi*.043)+fi*1.4))*.63;
  field+=(.025+u_shape.y*.065)/(dot(cc-c,cc-c)+.006);}
 if(u_cursor.x>.001){vec2 m=u_cursor.yz;field+=u_cursor.x*.05/(dot(cc-m,cc-m)+.01);}
 float surface=smoothstep(mix(1.2,.3,u_shape.z),mix(3.4,1.6,u_shape.z),field);
 vec3 col=palette(clamp(surface+field*.05,0.,1.));
 float d=hexDist(hc.zw);
 float gap=1.-smoothstep(.455,.5,d);       // thin seam between cells
 float rim=smoothstep(.30,.47,d);          // soft rim lift on lit cells
 col=mix(col,col*1.08+.012,rim*.4*surface);
 col*=.96+.08*hash21(hc.xy+u_seed);        // per-cell variation
 return mix(u_colors[0],col,gap);
}
void main(){
 vec2 p=(gl_FragCoord.xy-.5*u_res)/min(u_res.x,u_res.y);
 p*=u_shape.x;
 vec3 col=shade(p,u_time);
 vec3 g3=fract(vec3(gl_FragCoord.xyx)*.1031);g3+=dot(g3,g3.yzx+33.33);
 col+=(fract((g3.x+g3.y)*g3.z)-.5)*.03;   // film grain
 gl_FragColor=vec4(clamp(col,0.,1.),1.);
}`

type Preset = {
  colors: [number, number, number][]
  scale: number
  intensity: number
  paramA: number
  density: number
  seed: number
}

export const HEX_PRESETS: Record<HexShaderVariant, Preset> = {
  dark: {
    colors: [
      [0.043, 0.047, 0.055],
      [0.055, 0.2, 0.215],
      [0.22, 0.52, 0.51],
      [0.62, 0.85, 0.83],
    ],
    scale: 1.26,
    intensity: 0.35,
    paramA: 0.3,
    density: 14,
    seed: 6515,
  },
  light: {
    colors: [
      [0.949, 0.941, 0.922],
      [0.855, 0.905, 0.895],
      [0.62, 0.78, 0.765],
      [0.4, 0.63, 0.615],
    ],
    scale: 1.26,
    intensity: 0.3,
    paramA: 0.3,
    density: 14,
    seed: 2211,
  },
}

export function HexShaderBackground({
  variant = "dark",
  density,
  intensity,
  timeScale = 1,
  cursor = true,
  className,
}: HexShaderProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const gl = cv.getContext("webgl", { antialias: false })
    if (!gl) return

    const P = HEX_PRESETS[variant]
    const dens = density ?? P.density
    const inten = intensity ?? P.intensity
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const speed = reduce ? 0 : 0.575 * timeScale

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("[HexShader]", gl.getShaderInfoLog(s))
      }
      return s
    }
    const program = gl.createProgram()!
    const vs = compile(gl.VERTEX_SHADER, VERT)
    const fs = compile(gl.FRAGMENT_SHADER, FRAG)
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    gl.useProgram(program)

    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const U = (n: string) => gl.getUniformLocation(program, n)
    gl.uniform3fv(U("u_colors"), new Float32Array(P.colors.flat()))
    gl.uniform4f(U("u_shape"), P.scale, inten, P.paramA, dens)
    gl.uniform1f(U("u_seed"), P.seed % 31)
    const uScene = U("u_scene")
    const uCursor = U("u_cursor")

    let mx = 0, my = 0, tx = 0, ty = 0, pres = 0, tp = 0
    let inView = true
    let visible = document.visibilityState === "visible"
    let raf = 0
    let disposed = false
    const t0 = performance.now()

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.round(cv.clientWidth * dpr)
      const h = Math.round(cv.clientHeight * dpr)
      if (w === 0 || h === 0) return
      const s = Math.min(1, Math.sqrt(2_000_000 / (w * h))) // ~2M pixel cap
      const W = Math.max(1, Math.round(w * s))
      const H = Math.max(1, Math.round(h * s))
      if (cv.width !== W || cv.height !== H) {
        cv.width = W
        cv.height = H
        gl.viewport(0, 0, W, H)
      }
    }

    const frame = (now: number) => {
      raf = 0
      if (disposed || !inView || !visible) return
      size()
      mx += (tx - mx) * 0.08
      my += (ty - my) * 0.08
      pres += (tp - pres) * 0.08
      gl.uniform4f(uScene, cv.width, cv.height, ((now - t0) / 1000) * speed, 0)
      gl.uniform4f(uCursor, pres, mx, my, 0.4)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      // Keep looping whenever time is animating. Reduced motion: only while the cursor settles.
      const settling = Math.abs(tp - pres) > 0.002
      if (speed > 0 || settling) raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (!raf && !disposed && inView && visible) raf = requestAnimationFrame(frame)
    }

    const onPointer = (e: PointerEvent) => {
      const b = cv.getBoundingClientRect()
      const inside =
        e.clientX >= b.left && e.clientX <= b.right && e.clientY >= b.top && e.clientY <= b.bottom
      if (!inside) {
        tp = 0
        kick()
        return
      }
      const m = Math.min(b.width, b.height)
      tx = ((e.clientX - b.left - b.width / 2) / m) * P.scale
      ty = ((b.height / 2 - (e.clientY - b.top)) / m) * P.scale
      tp = 1
      kick()
    }
    const onVis = () => {
      visible = document.visibilityState === "visible"
      kick()
    }

    const io = new IntersectionObserver((es) => {
      inView = es[0]?.isIntersecting ?? true
      kick()
    })
    io.observe(cv)
    const ro = new ResizeObserver(() => {
      size()
      kick()
    })
    ro.observe(cv)
    document.addEventListener("visibilitychange", onVis)
    if (cursor) window.addEventListener("pointermove", onPointer, { passive: true })

    size()
    kick()

    return () => {
      disposed = true
      if (raf) cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      document.removeEventListener("visibilitychange", onVis)
      if (cursor) window.removeEventListener("pointermove", onPointer)
      gl.deleteBuffer(buf)
      gl.deleteProgram(program)
      gl.getExtension("WEBGL_lose_context")?.loseContext()
    }
  }, [variant, density, intensity, timeScale, cursor])

  return (
    <canvas
      ref={ref}
      className={className}
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  )
}

export default HexShaderBackground
