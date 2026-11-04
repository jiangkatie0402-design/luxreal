/**
 * Background texture: a wireframe of a 3D Gaussian surface (two bumps on a plane),
 * rotated and projected in perspective, drawn as SVG polylines. Pure geometry —
 * no image assets. Colours come from the mesh gradient passed in.
 */
const N = 44; // grid resolution
const VB_W = 1600;
const VB_H = 900;

function surface(x: number, y: number) {
  return (
    0.8 * Math.exp(-((x + 0.25) ** 2 + (y - 0.1) ** 2) / 0.14) +
    0.55 * Math.exp(-((x - 0.55) ** 2 + (y + 0.25) ** 2) / 0.08) -
    0.18 * Math.exp(-((x - 0.15) ** 2 + (y + 0.75) ** 2) / 0.18)
  );
}

function project(x: number, y: number, z: number): [number, number] {
  const rz = -0.5; // spin about the vertical axis
  const tilt = 0.62; // look down onto the plane
  const xr = x * Math.cos(rz) - y * Math.sin(rz);
  const yr = x * Math.sin(rz) + y * Math.cos(rz);
  const depth = yr * Math.cos(tilt) - z * Math.sin(tilt);
  const up = yr * Math.sin(tilt) + z * Math.cos(tilt);
  const d = 3.4;
  const f = d / (d + depth);
  return [VB_W / 2 + xr * f * 640, VB_H * 0.88 - up * f * 520];
}

function buildPaths() {
  const pts: [number, number][][] = [];
  for (let i = 0; i <= N; i++) {
    const row: [number, number][] = [];
    for (let j = 0; j <= N; j++) {
      const x = -1.25 + (2.5 * j) / N;
      const y = -1.25 + (2.5 * i) / N;
      row.push(project(x, y, surface(x, y)));
    }
    pts.push(row);
  }
  const line = (p: [number, number][]) =>
    'M' + p.map(([a, b]) => `${a.toFixed(1)} ${b.toFixed(1)}`).join('L');
  const rows = pts.map(line);
  const cols = pts[0].map((_, j) => line(pts.map((r) => r[j])));
  return [...rows, ...cols];
}

const PATHS = buildPaths();

export function GaussMesh({ from, to }: { from: string; to: string }) {
  return (
    <svg
      aria-hidden
      className="gauss-mesh pointer-events-none absolute inset-0 h-full w-full [mask-image:radial-gradient(65%_70%_at_50%_60%,#000_45%,transparent_85%)]"
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <defs>
        <linearGradient id="gauss-stroke" x1="0" y1="0" x2="1" y2="0.4">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <g stroke="url(#gauss-stroke)" strokeOpacity="0.5" strokeWidth="1">
        {PATHS.map((d, i) => (
          <path key={i} d={d} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  );
}
