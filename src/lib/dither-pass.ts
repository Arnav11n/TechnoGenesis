import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

/** Adds a tiny amount of noise so faint glow gradients on dark backgrounds don't show steps. */
export function createDitherPass() {
  return new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uTime: { value: 0 } },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float uTime;
      varying vec2 vUv;
      float h(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      void main() {
        vec4 c = texture2D(tDiffuse, vUv);
        float n = h(gl_FragCoord.xy + uTime) + h(gl_FragCoord.yx * 1.37 - uTime) - 1.0;
        c.rgb += n * (1.5 / 255.0);
        gl_FragColor = c;
      }
    `,
  });
}