"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { createDitherPass } from "@/lib/dither-pass";
import {
  motion,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "framer-motion";

/** Every counter on the page counts something that is really drawn here. */
export const COUNTS = { neurons: 30, basePairs: 16, actuators: 17 };

type Key = "accent" | "copper" | "bone";
type Colored = THREE.Material & { color: THREE.Color };
type Spec = {
  kind: "box" | "cyl" | "ico";
  s: [number, number, number];
  pos: [number, number, number];
  a: number;
  b: number;
  visor?: boolean;
};

const PAL = {
  dark: { bg: 0x040706, accent: 0xc8ff3a, copper: 0xe39a63, bone: 0xe8e4d6, fill: 0.07, bloom: true },
  light: { bg: 0xefece1, accent: 0x0a8044, copper: 0xd4501a, bone: 0x10231a, fill: 0.12, bloom: false },
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const smooth = (t: number) => t * t * (3 - 2 * t);
const rng = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const lr = (
  kind: Spec["kind"],
  s: [number, number, number],
  x: number,
  y: number,
  z: number,
  a: number,
  b: number,
): Spec[] => [
  { kind, s, pos: [-x, y, z], a, b },
  { kind, s, pos: [x, y, z], a, b },
];

// 17 armor parts: 3 core + 14 limbs. Each flies in during its [a, b] scroll range.
const SPECS: Spec[] = [
  { kind: "box", s: [2, 1.5, 1.1], pos: [0, 0.7, 0], a: 0.5, b: 0.58 },
  { kind: "box", s: [1.25, 1.1, 1.1], pos: [0, 2.2, 0], a: 0.51, b: 0.6, visor: true },
  { kind: "box", s: [1.5, 0.6, 0.9], pos: [0, -0.5, 0], a: 0.58, b: 0.66 },
  ...lr("ico", [0.45, 0, 0], 1.35, 1.2, 0, 0.55, 0.63),
  ...lr("cyl", [0.25, 1.2, 0], 1.5, 0.3, 0, 0.58, 0.66),
  ...lr("cyl", [0.22, 1.1, 0], 1.5, -0.9, 0, 0.61, 0.69),
  ...lr("box", [0.4, 0.4, 0.4], 1.5, -1.7, 0, 0.64, 0.72),
  ...lr("box", [0.5, 1.3, 0.6], 0.5, -1.5, 0, 0.62, 0.7),
  ...lr("box", [0.45, 1.3, 0.55], 0.5, -2.8, 0, 0.66, 0.74),
  ...lr("box", [0.6, 0.2, 0.9], 0.5, -3.55, 0.15, 0.7, 0.78),
];

const JOINTS: [number, number, number][] = [
  [-1.35, 1.2, 0], [1.35, 1.2, 0], [-1.5, -0.33, 0], [1.5, -0.33, 0],
  [-0.5, -0.85, 0], [0.5, -0.85, 0], [-0.5, -2.15, 0], [0.5, -2.15, 0],
];

const LOG = [
  { tag: "MIND LINK", line: "neural lattice … linking" },
  { tag: "BODY GROWTH", line: "membrane + genome … growing" },
  { tag: "FRAME DOCK", line: "actuators … docking" },
  { tag: "ONLINE", line: "all systems … alive" },
];

type Part = {
  spec: Spec;
  group: THREE.Group;
  edgeMat: THREE.LineBasicMaterial;
  trail: THREE.Line;
  trailMat: THREE.LineBasicMaterial;
  dir: THREE.Vector3;
  spin: THREE.Vector3;
  home: THREE.Vector3;
};

export function RobotViewport({ p }: { p: MotionValue<number> }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const pRef = useRef(p.get());
  const [stage, setStage] = useState(0);
  const [failed, setFailed] = useState(false);

  useMotionValueEvent(p, "change", (v) => {
    pRef.current = v;
    setStage(v < 0.25 ? 0 : v < 0.5 ? 1 : v < 0.8 ? 2 : 3);
  });

  const flash = useTransform(p, [0.8, 0.835, 0.88], [0, 0.28, 0]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    } catch {
      setFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const el = renderer.domElement;
    el.style.cssText = "width:100%;height:100%;display:block";
    mount.appendChild(el);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    const bgColor = new THREE.Color();
    scene.background = bgColor;
    const fog = new THREE.Fog(0x000000, 14, 30);
    scene.fog = fog;

    const colors = { accent: new THREE.Color(), copper: new THREE.Color(), bone: new THREE.Color() };
    const themed: { m: Colored; key: Key }[] = [];
    const fills: THREE.MeshBasicMaterial[] = [];
    let useBloom = true;

    const lineMat = (key: Key, opacity = 1) => {
      const m = new THREE.LineBasicMaterial({ transparent: true, opacity });
      themed.push({ m, key });
      return m;
    };
    const solidMat = (key: Key) => {
      const m = new THREE.MeshBasicMaterial();
      themed.push({ m, key });
      return m;
    };

    const rand = rng(7);
    const robot = new THREE.Group();
    scene.add(robot);

    /* ---------- environment: dust and floor ---------- */
    const dustPos = new Float32Array(450 * 3);
    for (let i = 0; i < 450; i++) {
      const r = 5 + rand() * 11;
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(2 * rand() - 1);
      dustPos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      dustPos[i * 3 + 1] = r * Math.cos(ph);
      dustPos[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
    }
    const dustMat = new THREE.PointsMaterial({ size: 0.05, transparent: true, opacity: 0.5, depthWrite: false });
    themed.push({ m: dustMat, key: "bone" });
    const dust = new THREE.Points(
      new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(dustPos, 3)),
      dustMat,
    );
    scene.add(dust);

    const FLOOR_Y = -3.7;
    const gp: number[] = [];
    for (let i = -14; i <= 14; i++) gp.push(i, 0, -14, i, 0, 14, -14, 0, i, 14, 0, i);
    const grid = new THREE.LineSegments(
      new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(gp, 3)),
      lineMat("accent", 0.2),
    );
    grid.position.y = FLOOR_Y;
    grid.visible = false;
    scene.add(grid);

    /* ---------- layer 1: MIND (neural cloud) ---------- */
    const neuronPts: THREE.Vector3[] = [];
    while (neuronPts.length < COUNTS.neurons) {
      const v = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1);
      const len = v.length();
      if (len <= 1 && len > 0.2) neuronPts.push(v.multiplyScalar(0.55));
    }
    const pairs: [number, number][] = [];
    const seen = new Set<string>();
    neuronPts.forEach((a, i) => {
      neuronPts
        .map((b, j) => ({ j, d: a.distanceTo(b) }))
        .filter((o) => o.j !== i)
        .sort((x, y) => x.d - y.d)
        .slice(0, 2)
        .forEach(({ j }) => {
          const k = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (!seen.has(k)) {
            seen.add(k);
            pairs.push([i, j]);
          }
        });
    });
    const neuralGroup = new THREE.Group();
    neuralGroup.position.set(0, 2.15, 0);
    const neuronMat = new THREE.PointsMaterial({ size: 0.13, transparent: true });
    themed.push({ m: neuronMat, key: "accent" });
    const neuronGeo = new THREE.BufferGeometry().setFromPoints(neuronPts);
    const edgeGeo = new THREE.BufferGeometry().setFromPoints(
      pairs.flatMap(([i, j]) => [neuronPts[i], neuronPts[j]]),
    );
    const PULSES = 6;
    const pulseGeo = new THREE.BufferGeometry().setAttribute(
      "position",
      new THREE.Float32BufferAttribute(new Float32Array(PULSES * 3), 3),
    );
    const pulseMat = new THREE.PointsMaterial({ size: 0.24, transparent: true });
    themed.push({ m: pulseMat, key: "bone" });
    const pulses = new THREE.Points(pulseGeo, pulseMat);
    pulses.frustumCulled = false;
    neuralGroup.add(
      new THREE.Points(neuronGeo, neuronMat),
      new THREE.LineSegments(edgeGeo, lineMat("accent", 0.8)),
      pulses,
    );
    robot.add(neuralGroup);

    /* ---------- layer 2: BODY (membrane, DNA, core) ---------- */
    const memGeo = new THREE.SphereGeometry(1, 28, 18);
    const membrane = new THREE.Group();
    membrane.position.set(0, 0.4, 0);
    const memFillMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.08, depthWrite: false, side: THREE.DoubleSide });
    themed.push({ m: memFillMat, key: "copper" });
    const memFill = new THREE.Mesh(memGeo, memFillMat);
    memFill.scale.set(1.15, 1.5, 0.75);
    const memWire = new THREE.LineSegments(new THREE.WireframeGeometry(memGeo), lineMat("copper", 0.3));
    memWire.scale.copy(memFill.scale);
    membrane.add(memFill, memWire);
    robot.add(membrane);

    const HELIX_N = 140;
    const H_BOTTOM = -0.7;
    const H_TOP = 1.5;
    const HR = 0.38;
    const helixPt = (i: number, phase: number) => {
      const f = i / (HELIX_N - 1);
      const a = f * 3 * Math.PI * 2 + phase;
      return new THREE.Vector3(Math.cos(a) * HR, H_BOTTOM + (H_TOP - H_BOTTOM) * f, Math.sin(a) * HR);
    };
    const dna = new THREE.Group();
    const strandA = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(Array.from({ length: HELIX_N }, (_, i) => helixPt(i, 0))),
      lineMat("accent", 1),
    );
    const strandB = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(Array.from({ length: HELIX_N }, (_, i) => helixPt(i, Math.PI))),
      lineMat("copper", 1),
    );
    const rungPts: THREE.Vector3[] = [];
    for (let r = 0; r < COUNTS.basePairs; r++) {
      const i = Math.round(6 + r * ((HELIX_N - 12) / (COUNTS.basePairs - 1)));
      rungPts.push(helixPt(i, 0), helixPt(i, Math.PI));
    }
    const rungs = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(rungPts), lineMat("bone", 0.75));
    dna.add(strandA, strandB, rungs);
    robot.add(dna);

    const coreGroup = new THREE.Group();
    coreGroup.position.set(0, 0.75, 0);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 16), solidMat("copper"));
    const halo = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.45, 1)),
      lineMat("copper", 0.9),
    );
    coreGroup.add(core, halo);
    robot.add(coreGroup);

    /* ---------- layer 3: FRAME (17 armor parts) ---------- */
    const geoOf = (s: Spec) =>
      s.kind === "box"
        ? new THREE.BoxGeometry(...s.s)
        : s.kind === "cyl"
          ? new THREE.CylinderGeometry(s.s[0], s.s[0], s.s[1], 18)
          : new THREE.IcosahedronGeometry(s.s[0], 1);

    const parts: Part[] = SPECS.map((spec) => {
      const geo = geoOf(spec);
      const group = new THREE.Group();
      const fillMat = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide });
      themed.push({ m: fillMat, key: "accent" });
      fills.push(fillMat);
      group.add(new THREE.Mesh(geo, fillMat));
      const edgeMat = new THREE.LineBasicMaterial({ transparent: true });
      group.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 20), edgeMat));
      if (spec.visor) {
        const visor = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.14, 0.05), solidMat("accent"));
        visor.position.set(0, 0.05, 0.58);
        group.add(visor);
      }
      const trailMat = lineMat("accent", 0.8);
      const trail = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]),
        trailMat,
      );
      trail.frustumCulled = false;
      robot.add(group, trail);
      return {
        spec,
        group,
        edgeMat,
        trail,
        trailMat,
        home: new THREE.Vector3(...spec.pos),
        dir: new THREE.Vector3(rand() * 2 - 1, rand() * 1.4 - 0.5, rand() * 2 - 1)
          .normalize()
          .multiplyScalar(7 + rand() * 6),
        spin: new THREE.Vector3((rand() - 0.5) * 5, (rand() - 0.5) * 5, (rand() - 0.5) * 5),
      };
    });

    const jointGeo = new THREE.SphereGeometry(0.12, 12, 10);
    const joints = JOINTS.map((pos) => {
      const m = new THREE.Mesh(jointGeo, solidMat("accent"));
      m.position.set(...pos);
      m.scale.setScalar(0.0001);
      robot.add(m);
      return m;
    });

    /* ---------- layer 4: ALIVE (shockwaves) ---------- */
    const rings = [0, 1, 2].map(() => {
      const mat = lineMat("accent", 0);
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(1, 0.014, 8, 120), mat as unknown as THREE.Material);
      mesh.rotation.x = Math.PI / 2;
      mesh.position.y = FLOOR_Y + 0.02;
      mesh.visible = false;
      scene.add(mesh);
      return { mesh, mat };
    });

    /* ---------- post-processing ---------- */
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.7, 0.55, 0.12);
    composer.addPass(bloom);
    composer.addPass(new OutputPass());
    const dither = createDitherPass();
    composer.addPass(dither);

    const applyTheme = () => {
      const pal = document.documentElement.getAttribute("data-theme") === "light" ? PAL.light : PAL.dark;
      colors.accent.set(pal.accent);
      colors.copper.set(pal.copper);
      colors.bone.set(pal.bone);
      bgColor.set(pal.bg);
      fog.color.copy(bgColor);
      themed.forEach(({ m, key }) => m.color.copy(colors[key]));
      fills.forEach((f) => (f.opacity = pal.fill));
      useBloom = pal.bloom;
    };
    applyTheme();
    const mo = new MutationObserver(applyTheme);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(mount);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    const tmp = new THREE.Vector3();
    let sp = pRef.current;
    let raf = 0;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const time = reduced ? 0 : (performance.now() - t0) / 1000;
      sp += (pRef.current - sp) * 0.14;

      // mind
      const nCount = Math.floor(seg(sp, 0.02, 0.2) * COUNTS.neurons);
      neuronGeo.setDrawRange(0, nCount);
      edgeGeo.setDrawRange(0, Math.floor(seg(sp, 0.1, 0.26) * pairs.length) * 2);
      neuralGroup.visible = nCount > 0;
      neuralGroup.scale.setScalar(1 + Math.sin(time * 2) * 0.03);
      pulses.visible = sp > 0.27;
      const pa = pulseGeo.attributes.position as THREE.BufferAttribute;
      for (let k = 0; k < PULSES; k++) {
        const [i, j] = pairs[(k * 5) % pairs.length];
        const ph = (time * 0.6 + k * 0.19) % 1;
        tmp.copy(neuronPts[i]).lerp(neuronPts[j], ph);
        pa.setXYZ(k, tmp.x, tmp.y, tmp.z);
      }
      pa.needsUpdate = true;

      // body
      const m = easeBack(seg(sp, 0.27, 0.4));
      membrane.visible = m > 0.001;
      membrane.scale.setScalar(Math.max(0.0001, m) * (1 + Math.sin(time * 2) * 0.015));
      strandA.geometry.setDrawRange(0, Math.floor(seg(sp, 0.33, 0.45) * HELIX_N));
      strandB.geometry.setDrawRange(0, Math.floor(seg(sp, 0.34, 0.46) * HELIX_N));
      rungs.geometry.setDrawRange(0, Math.floor(seg(sp, 0.38, 0.5) * COUNTS.basePairs) * 2);
      dna.rotation.y = time * 0.7;
      const c = easeBack(seg(sp, 0.44, 0.5));
      const beat = 1 + 0.18 * Math.pow(Math.abs(Math.sin(time * 2.6)), 8);
      coreGroup.visible = c > 0.001;
      coreGroup.scale.setScalar(Math.max(0.0001, c) * beat);
      halo.rotation.y = time;
      halo.rotation.x = time * 0.6;

      // frame
      parts.forEach((pt) => {
        const { a, b } = pt.spec;
        const t = seg(sp, a, b);
        const e = easeOut(t);
        pt.group.visible = t > 0;
        pt.trail.visible = t > 0 && t < 1;
        if (t <= 0) return;
        pt.group.position.copy(pt.home).addScaledVector(pt.dir, 1 - e);
        pt.group.rotation.set(pt.spin.x * (1 - e), pt.spin.y * (1 - e), pt.spin.z * (1 - e));
        const f = sp >= b ? clamp01(1 - (sp - b) / 0.045) : 0;
        pt.group.scale.setScalar(1 + f * 0.07);
        pt.edgeMat.opacity = clamp01(t * 5);
        pt.edgeMat.color.copy(colors.bone).lerp(colors.accent, f);
        if (useBloom) pt.edgeMat.color.multiplyScalar(1 + f * 1.6);
        const tp = pt.trail.geometry.attributes.position as THREE.BufferAttribute;
        const p0 = pt.group.position;
        tmp.copy(pt.dir).normalize().multiplyScalar((1 - e) * 2.8).add(p0);
        tp.setXYZ(0, p0.x, p0.y, p0.z);
        tp.setXYZ(1, tmp.x, tmp.y, tmp.z);
        tp.needsUpdate = true;
        pt.trailMat.opacity = 0.8 * (1 - t);
      });
      joints.forEach((jm, i) => {
        jm.scale.setScalar(Math.max(0.0001, easeBack(seg(sp, 0.76 + i * 0.004, 0.8 + i * 0.004))));
      });

      // alive
      const live = seg(sp, 0.82, 0.87);
      grid.visible = sp > 0.45;
      (grid.material as THREE.LineBasicMaterial).opacity = 0.2 * seg(sp, 0.45, 0.6);
      rings.forEach((r, i) => {
        const ph = (time * 0.3 + i / 3) % 1;
        r.mesh.visible = live > 0;
        r.mesh.scale.setScalar(1 + ph * 9);
        r.mat.opacity = (1 - ph) * 0.85 * live;
      });

      // motion of the whole robot and the camera
      robot.rotation.y =
        Math.sin(sp * 6) * 0.45 + smooth(seg(sp, 0.82, 1)) * Math.PI * 2 + Math.sin(time * 0.5) * 0.05;
      dust.rotation.y = time * 0.02;

      const s1 = seg(sp, 0.22, 0.52);
      const s2 = seg(sp, 0.5, 0.86);
      const s3 = seg(sp, 0.86, 1);
      const dist = 5 + 4 * smooth(s1) + 3 * smooth(s2) - 0.5 * smooth(s3);
      const ty = 2.15 - 1.35 * smooth(s1) - 1.15 * smooth(s2);
      const fit = Math.max(1, 0.78 / camera.aspect);
      camera.position.set(Math.sin(time * 0.25) * 0.6, ty + 0.4, dist * fit);
      camera.lookAt(0, ty, 0);

      const peak = clamp01(1 - Math.abs(sp - 0.835) / 0.05);
      bloom.strength = 0.65 + peak * 1.5 + seg(sp, 0.8, 1) * 0.25;

      dither.uniforms.uTime.value = (time % 40) * 60;
      if (useBloom) composer.render();
      else renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      scene.traverse((o) => {
        const g = (o as THREE.Mesh).geometry;
        if (g) g.dispose();
      });
      themed.forEach((t) => t.m.dispose());
      parts.forEach((pt) => pt.edgeMat.dispose());
      composer.dispose();
      renderer.dispose();
      el.remove();
    };
  }, []);

  return (
    <div className="absolute inset-0">
      <div
        ref={mountRef}
        className="absolute inset-0 overflow-hidden rounded-2xl border border-lime-glow/30 bg-ink-900"
      />

      {failed && (
        <div className="absolute inset-0 grid place-items-center px-8 text-center font-mono text-xs uppercase tracking-[0.25em] text-bone-300">
          The 3D view needs WebGL. Turn on graphics acceleration in your browser.
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0_3px,rgb(var(--glow)/0.05)_3px_4px)]" />
        <motion.div style={{ opacity: flash }} className="absolute inset-0 bg-lime-glow" />
      </div>

      {[
        "left-3 top-3 border-l-2 border-t-2",
        "right-3 top-3 border-r-2 border-t-2",
        "bottom-3 left-3 border-b-2 border-l-2",
        "bottom-3 right-3 border-b-2 border-r-2",
      ].map((c) => (
        <span key={c} className={`pointer-events-none absolute size-6 border-lime-glow ${c}`} />
      ))}

      <div className="pointer-events-none absolute left-7 top-6 flex items-center gap-2 font-mono text-[0.625rem] uppercase tracking-[0.25em] text-bone-300">
        <span className="size-1.5 animate-pulse-slow rounded-full bg-red-400" />
        CAM-01 · LIVE
      </div>
      <div className="pointer-events-none absolute right-7 top-6 font-mono text-[0.625rem] uppercase tracking-[0.25em] text-lime-glow">
        {LOG[stage].tag}
      </div>

      <div className="pointer-events-none absolute bottom-6 left-7 space-y-1 font-mono text-[0.625rem] uppercase tracking-[0.18em]">
        {LOG.slice(0, stage + 1).map((l, i) => (
          <motion.p
            key={l.tag}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className={i === stage ? "text-bone-50" : "text-bone-500"}
          >
            &gt; {l.line}
            {i < stage && <span className="ml-2 text-lime-glow">OK</span>}
          </motion.p>
        ))}
      </div>
    </div>
  );
}