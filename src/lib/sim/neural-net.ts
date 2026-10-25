export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A small neural network: tanh hidden layers, sigmoid output, trained with Adam. */
export class Mlp {
  readonly sizes: number[];
  readonly W: Float64Array[] = [];
  readonly B: Float64Array[] = [];
  private mW: Float64Array[] = [];
  private vW: Float64Array[] = [];
  private mB: Float64Array[] = [];
  private vB: Float64Array[] = [];
  private gW: Float64Array[] = [];
  private gB: Float64Array[] = [];
  private act: Float64Array[];
  private d: Float64Array[];
  private t = 0;

  constructor(sizes: number[], seed: number) {
    this.sizes = sizes;
    const rand = mulberry32(seed);
    for (let l = 0; l < sizes.length - 1; l++) {
      const nin = sizes[l];
      const nout = sizes[l + 1];
      const lim = Math.sqrt(6 / (nin + nout));
      const w = new Float64Array(nin * nout).map(() => (rand() * 2 - 1) * lim);
      this.W.push(w);
      this.B.push(new Float64Array(nout));
      this.mW.push(new Float64Array(w.length));
      this.vW.push(new Float64Array(w.length));
      this.gW.push(new Float64Array(w.length));
      this.mB.push(new Float64Array(nout));
      this.vB.push(new Float64Array(nout));
      this.gB.push(new Float64Array(nout));
    }
    this.act = sizes.map((n) => new Float64Array(n));
    this.d = sizes.map((n) => new Float64Array(n));
  }

  /** Returns the probability (0 to 1) that the point (x0, x1) belongs to group 1. */
  forward(x0: number, x1: number): number {
    const a = this.act;
    a[0][0] = x0;
    a[0][1] = x1;
    const L = this.W.length;
    for (let l = 0; l < L; l++) {
      const nin = this.sizes[l];
      const nout = this.sizes[l + 1];
      const w = this.W[l];
      const b = this.B[l];
      const inp = a[l];
      const out = a[l + 1];
      for (let j = 0; j < nout; j++) {
        let s = b[j];
        const o = j * nin;
        for (let i = 0; i < nin; i++) s += w[o + i] * inp[i];
        out[j] = l === L - 1 ? 1 / (1 + Math.exp(-s)) : Math.tanh(s);
      }
    }
    return a[L][0];
  }

  /** One learning step on a mini-batch. idx lists which examples to use. */
  train(xs: number[][], ys: number[], idx: number[], lr: number) {
    const L = this.W.length;
    this.gW.forEach((g) => g.fill(0));
    this.gB.forEach((g) => g.fill(0));

    for (const k of idx) {
      const p = this.forward(xs[k][0], xs[k][1]);
      this.d[L][0] = p - ys[k];
      for (let l = L - 1; l >= 0; l--) {
        const nin = this.sizes[l];
        const nout = this.sizes[l + 1];
        const w = this.W[l];
        const inp = this.act[l];
        const dn = this.d[l + 1];
        const dp = this.d[l];
        if (l > 0) dp.fill(0);
        for (let j = 0; j < nout; j++) {
          const g = dn[j];
          this.gB[l][j] += g;
          const o = j * nin;
          for (let i = 0; i < nin; i++) {
            this.gW[l][o + i] += g * inp[i];
            if (l > 0) dp[i] += g * w[o + i];
          }
        }
        if (l > 0) for (let i = 0; i < nin; i++) dp[i] *= 1 - inp[i] * inp[i];
      }
    }

    // Adam update
    this.t++;
    const b1 = 0.9;
    const b2 = 0.999;
    const c1 = 1 - Math.pow(b1, this.t);
    const c2 = 1 - Math.pow(b2, this.t);
    const scale = 1 / idx.length;
    const apply = (p: Float64Array, g: Float64Array, m: Float64Array, v: Float64Array) => {
      for (let i = 0; i < p.length; i++) {
        const gi = g[i] * scale;
        m[i] = b1 * m[i] + (1 - b1) * gi;
        v[i] = b2 * v[i] + (1 - b2) * gi * gi;
        p[i] -= (lr * (m[i] / c1)) / (Math.sqrt(v[i] / c2) + 1e-8);
      }
    };
    for (let l = 0; l < L; l++) {
      apply(this.W[l], this.gW[l], this.mW[l], this.vW[l]);
      apply(this.B[l], this.gB[l], this.mB[l], this.vB[l]);
    }
  }
}

export type DatasetId = "blobs" | "circle" | "xor" | "spiral";
export type Dataset = { xs: number[][]; ys: number[] };

export function makeDataset(id: DatasetId, seed = 3): Dataset {
  const r = mulberry32(seed);
  const gauss = () => {
    let u = 0;
    let v = 0;
    while (!u) u = r();
    while (!v) v = r();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const xs: number[][] = [];
  const ys: number[] = [];
  const N = 100;

  if (id === "blobs") {
    for (let i = 0; i < N; i++) {
      xs.push([-0.5 + gauss() * 0.2, -0.45 + gauss() * 0.2]);
      ys.push(0);
      xs.push([0.5 + gauss() * 0.2, 0.45 + gauss() * 0.2]);
      ys.push(1);
    }
  } else if (id === "circle") {
    for (let i = 0; i < N; i++) {
      const a1 = r() * Math.PI * 2;
      const r1 = r() * 0.38;
      xs.push([Math.cos(a1) * r1, Math.sin(a1) * r1]);
      ys.push(1);
      const a2 = r() * Math.PI * 2;
      const r2 = 0.62 + r() * 0.3;
      xs.push([Math.cos(a2) * r2, Math.sin(a2) * r2]);
      ys.push(0);
    }
  } else if (id === "xor") {
    while (xs.length < 2 * N) {
      const x = (r() * 2 - 1) * 0.9;
      const y = (r() * 2 - 1) * 0.9;
      if (Math.abs(x) < 0.12 || Math.abs(y) < 0.12) continue;
      xs.push([x, y]);
      ys.push(x * y > 0 ? 1 : 0);
    }
  } else {
    for (let i = 0; i < N; i++) {
      const t = i / N;
      const rad = 0.08 + t * 0.85;
      for (let c = 0; c < 2; c++) {
        const ang = t * 3.5 * Math.PI + c * Math.PI;
        xs.push([rad * Math.cos(ang) + gauss() * 0.02, rad * Math.sin(ang) + gauss() * 0.02]);
        ys.push(c);
      }
    }
  }
  return { xs, ys };
}