/**
 * Runs the prototype's own fit rules (reference/room-planner.html) in Node against a stub
 * THREE and DOM, and writes tests/fixtures/prototype-fit.json: for every room, model, wall and
 * stud, what the prototype says. tests/fit.test.ts compares lib/fit.ts to this fixture.
 *   node scripts/prototype-fit-fixture.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import vm from "node:vm";

const html = readFileSync(new URL("../reference/room-planner.html", import.meta.url), "utf8");
let js = html.slice(html.lastIndexOf("<script>") + "<script>".length, html.lastIndexOf("</script>"));
// Expose the closure's rule functions before the IIFE closes.
js = js.replace(/\n\s*buildBoard\(\);\n\s*selectRoom\('bedroom'\);/, "\n  window.__proto = { evaluate, goodSpots, studsFor, selectRoom, setModel: k => { modelKey = k; }, ROOMS };\n  buildBoard();\n  selectRoom('bedroom');");

/* ---- minimal THREE stub: real vectors, everything else permissive ---- */
class Vector3 {
  constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
  copy(v) { return this.set(v.x, v.y, v.z); }
  clone() { return new Vector3(this.x, this.y, this.z); }
  sub(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
  addScaledVector(v, s) { this.x += v.x * s; this.y += v.y * s; this.z += v.z * s; return this; }
  length() { return Math.hypot(this.x, this.y, this.z); }
  normalize() { const l = this.length() || 1; return this.set(this.x / l, this.y / l, this.z / l); }
  lerp() { return this; }
  project() { return this; }
}
class Vector2 { set() { return this; } }
class Quaternion { setFromUnitVectors() { return this; } setFromAxisAngle() { return this; } copy() { return this; } slerp() { return this; } }
class Color { constructor() {} set() { return this; } }
class Obj {
  constructor() { this.position = new Vector3(); this.rotation = { x: 0, y: 0, z: 0 }; this.quaternion = new Quaternion(); this.children = []; this.userData = {}; this.visible = true; }
  add(o) { this.children.push(o); return this; }
  remove(o) { this.children = this.children.filter((c) => c !== o); return this; }
  traverse(f) { f(this); this.children.forEach((c) => c.traverse && c.traverse(f)); }
  clone() { const c = new this.constructor(); Object.assign(c, this); c.position = this.position.clone(); return c; }
  localToWorld(v) { return v; }
  lookAt() {}
  updateProjectionMatrix() {}
}
class Geometry { constructor() { this.attributes = { position: { count: 0, getX: () => 0, getZ: () => 0, setZ: () => {} } }; } dispose() {} computeVertexNormals() {} }
class Material { constructor(o = {}) { Object.assign(this, o); this.emissive = new Color(); this.color = new Color(); } dispose() {} }
class Texture { constructor() { this.repeat = { set() {} }; } dispose() {} }
class Shape { constructor() { this.holes = []; } moveTo() {} lineTo() {} quadraticCurveTo() {} closePath() {} }
const THREE = {
  Vector3, Vector2, Quaternion, Color, Group: Obj, Mesh: class extends Obj { constructor(g, m) { super(); this.geometry = g; this.material = m; } }, Scene: Obj, PerspectiveCamera: Obj,
  HemisphereLight: Obj, DirectionalLight: class extends Obj { constructor() { super(); this.target = new Obj(); this.shadow = { mapSize: { set() {} }, camera: new Obj() }; } },
  BoxGeometry: Geometry, CylinderGeometry: Geometry, SphereGeometry: Geometry, PlaneGeometry: Geometry, CapsuleGeometry: Geometry, ExtrudeGeometry: Geometry,
  MeshStandardMaterial: Material, MeshBasicMaterial: Material, CanvasTexture: Texture, Shape, Path: Shape, Raycaster: class { setFromCamera() {} intersectObject() { return []; } intersectObjects() { return []; } },
  ColorManagement: {}, WebGLRenderer: class { constructor() { this.shadowMap = {}; } setPixelRatio() {} setSize() {} render() {} },
  sRGBEncoding: 1, ACESFilmicToneMapping: 1, PCFSoftShadowMap: 1, DoubleSide: 2, RepeatWrapping: 1, ClampToEdgeWrapping: 1,
};
const el = () => new Proxy({ classList: { toggle() {}, add() {} }, style: {}, dataset: {}, addEventListener() {}, setAttribute() {}, focus() {}, getBoundingClientRect() { return { left: 0, top: 0, width: 800, height: 500 }; }, clientWidth: 800, clientHeight: 500, getContext() { return new Proxy({}, { get: (t, k) => (k === "globalAlpha" ? 1 : () => {}), set: () => true }); } }, { get: (t, k) => (k in t ? t[k] : (t[k] = undefined)), set: (t, k, v) => ((t[k] = v), true) });
const window = { THREE, matchMedia: () => ({ matches: false, addEventListener() {} }), devicePixelRatio: 1 };
const sandbox = { window, THREE, document: { querySelector: () => el(), querySelectorAll: () => [], createElement: () => el() }, ResizeObserver: class { observe() {} }, requestAnimationFrame: () => 0, performance: { now: () => 0 }, console, Math };
vm.createContext(sandbox);
vm.runInContext(js, sandbox);

const P = sandbox.window.__proto;
const fixture = {};
for (const key of Object.keys(P.ROOMS)) {
  P.selectRoom(key);
  fixture[key] = {};
  for (const mk of ["std", "xt"]) {
    P.setModel(mk);
    const walls = {};
    for (const side of ["left", "back", "right"]) {
      walls[side] = P.studsFor(side).map((u) => { const e = P.evaluate(side, u); return { u, ok: e.ok, wallOK: e.wallOK, heightOK: e.heightOK, zoneOK: e.zoneOK, wallBy: e.wallBy || null, zoneBy: e.zoneBy || null, top: e.top }; });
    }
    fixture[key][mk] = { goodSpots: P.goodSpots(mk), walls };
  }
}
mkdirSync(new URL("../tests/fixtures/", import.meta.url), { recursive: true });
writeFileSync(new URL("../tests/fixtures/prototype-fit.json", import.meta.url), JSON.stringify(fixture, null, 1));
for (const [k, v] of Object.entries(fixture)) console.log(k, "std", v.std.goodSpots, "xt", v.xt.goodSpots);
console.log("✓ wrote tests/fixtures/prototype-fit.json");
