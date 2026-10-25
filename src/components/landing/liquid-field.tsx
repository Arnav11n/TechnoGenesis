"use client";

import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uPower;
uniform float uDark;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    v += amp * noise(p);
    p = p * 2.02 + vec2(11.7, 3.1);
    amp *= 0.5;
  }
  return v;
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / uRes;
  vec2 p = (frag - 0.5 * uRes) / uRes.y;
  vec2 m = (uMouse * uRes - 0.5 * uRes) / uRes.y;

  // The cursor bends the fluid like a glass lens, with a soft ripple.
  vec2 toMouse = p - m;
  float d = length(toMouse);
  float lens = exp(-d * 3.2) * uPower;
  p += toMouse * lens * 0.55;
  p += normalize(toMouse + 0.0001) * sin(d * 24.0 - uTime * 3.0) * exp(-d * 5.0) * 0.02 * uPower;

  float t = uTime * 0.07;

  // Domain warping: the fluid folds into itself.
  vec2 q = vec2(
    fbm(p * 1.5 + vec2(0.0, t)),
    fbm(p * 1.5 + vec2(5.2, 1.3) - t)
  );
  vec2 r = vec2(
    fbm(p * 1.5 + 2.4 * q + vec2(1.7, 9.2) + t * 1.4),
    fbm(p * 1.5 + 2.4 * q + vec2(8.3, 2.8) - t * 1.2)
  );
  float f = fbm(p * 1.3 + 2.6 * r);

  // Dark palette
  vec3 inkD    = vec3(0.016, 0.027, 0.024);
  vec3 forestD = vec3(0.047, 0.141, 0.098);
  vec3 limeD   = vec3(0.784, 1.0, 0.227);
  vec3 copperD = vec3(0.89, 0.60, 0.39);
  // Light palette
  vec3 paper   = vec3(0.969, 0.961, 0.933);
  vec3 sage    = vec3(0.84, 0.91, 0.82);
  vec3 emerald = vec3(0.04, 0.50, 0.27);
  vec3 copperL = vec3(0.83, 0.31, 0.10);

  vec3 bgA    = mix(paper, inkD, uDark);
  vec3 bgB    = mix(sage, forestD, uDark);
  vec3 accent = mix(emerald, limeD, uDark);
  vec3 cop    = mix(copperL, copperD, uDark);

  vec3 col = mix(bgA, bgB, smoothstep(0.25, 0.75, f));

  // Thin bright ridges where the fluid folds: the "liquid light".
  float ridge = pow(1.0 - abs(f * 2.0 - 1.0), 6.0);
  col = mix(col, accent, clamp(ridge * 0.9, 0.0, 1.0));

  // Copper currents.
  float cu = smoothstep(0.55, 0.95, r.x) * smoothstep(0.35, 0.8, f);
  col = mix(col, cop, cu * 0.55);

  // Glow around the cursor.
  col = mix(col, accent, exp(-d * 5.0) * 0.18 * uPower);

  // Keep the left side calm so the headline stays readable.
  float side = smoothstep(0.05, 0.85, uv.x);
  col = mix(bgA, col, 0.25 + 0.75 * side);

  // Vignette
  col = mix(col, bgA, clamp(0.6 * pow(length(uv - 0.5) * 1.15, 2.0), 0.0, 1.0));

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

const isDark = () =>
  document.documentElement.getAttribute("data-theme") !== "light";

/** A GPU-drawn liquid that bends around your cursor and follows the theme. */
export function LiquidField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      powerPreference: "high-performance",
    });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(program, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, "uRes");
    const uTime = gl.getUniformLocation(program, "uTime");
    const uMouse = gl.getUniformLocation(program, "uMouse");
    const uPower = gl.getUniformLocation(program, "uPower");
    const uDark = gl.getUniformLocation(program, "uDark");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Half resolution: the fluid is soft, and this keeps it fast.
    const SCALE = 0.5;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(2, Math.floor(rect.width * SCALE));
      canvas.height = Math.max(2, Math.floor(rect.height * SCALE));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };

    const target = { x: 0.72, y: 0.5 };
    const current = { x: 0.72, y: 0.5 };
    let power = 0;
    let targetPower = 0;
    let dark = isDark() ? 1 : 0;
    let darkTarget = dark;
    const stillTime = 8;

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      target.x = (e.clientX - rect.left) / rect.width;
      target.y = 1 - (e.clientY - rect.top) / rect.height;
      targetPower = 1;
    };
    const onLeave = () => {
      targetPower = 0;
    };

    const draw = (time: number) => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      power += (targetPower - power) * 0.06;
      dark += (darkTarget - dark) * 0.12;
      gl.uniform1f(uTime, time);
      gl.uniform2f(uMouse, current.x, current.y);
      gl.uniform1f(uPower, power);
      gl.uniform1f(uDark, dark);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    resize();

    let raf = 0;
    if (reduced) {
      dark = darkTarget;
      draw(stillTime);
    } else {
      const start = performance.now();
      const loop = (now: number) => {
        draw((now - start) / 1000 + 8);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    // Follow theme changes
    const themeObserver = new MutationObserver(() => {
      darkTarget = isDark() ? 1 : 0;
      if (reduced) {
        dark = darkTarget;
        draw(stillTime);
      }
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    window.addEventListener("pointermove", onMove);
    document.addEventListener("mouseleave", onLeave);
    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduced) draw(stillTime);
    });
    resizeObserver.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      resizeObserver.disconnect();
      themeObserver.disconnect();
    };
  }, []);

  return (
    <div className={className} aria-hidden>
      {/* Shown only if the browser can't run the shader */}
      <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_70%_50%,rgb(var(--glow)/0.22),transparent),radial-gradient(40%_40%_at_85%_80%,rgba(227,154,99,0.2),transparent)]" />
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}