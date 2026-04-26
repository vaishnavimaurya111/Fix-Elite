import { useMemo } from "react";

interface GearLoaderProps {
  size?: number;
  speed?: number;
  className?: string;
  label?: string;
}

function generateGearPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  numTeeth: number,
  holeR: number
): string {
  const step = (Math.PI * 2) / numTeeth;
  const t = step * 0.08; // transition angle
  let d = "";

  // Outer gear profile (clockwise)
  for (let i = 0; i < numTeeth; i++) {
    const a = i * step;
    const p1x = cx + innerR * Math.cos(a);
    const p1y = cy + innerR * Math.sin(a);
    const p2x = cx + outerR * Math.cos(a + t);
    const p2y = cy + outerR * Math.sin(a + t);
    const p3x = cx + outerR * Math.cos(a + step * 0.5 - t);
    const p3y = cy + outerR * Math.sin(a + step * 0.5 - t);
    const p4x = cx + innerR * Math.cos(a + step * 0.5);
    const p4y = cy + innerR * Math.sin(a + step * 0.5);

    if (i === 0) {
      d += `M${p1x.toFixed(2)},${p1y.toFixed(2)} `;
    } else {
      d += `L${p1x.toFixed(2)},${p1y.toFixed(2)} `;
    }
    d += `L${p2x.toFixed(2)},${p2y.toFixed(2)} `;
    d += `L${p3x.toFixed(2)},${p3y.toFixed(2)} `;
    d += `L${p4x.toFixed(2)},${p4y.toFixed(2)} `;
  }
  d += "Z ";

  // Center hole (counter-clockwise for evenodd cutout)
  const holeSteps = 32;
  for (let i = holeSteps; i >= 0; i--) {
    const a = (i / holeSteps) * Math.PI * 2;
    const hx = cx + holeR * Math.cos(a);
    const hy = cy + holeR * Math.sin(a);
    if (i === holeSteps) {
      d += `M${hx.toFixed(2)},${hy.toFixed(2)} `;
    } else {
      d += `L${hx.toFixed(2)},${hy.toFixed(2)} `;
    }
  }
  d += "Z";

  return d;
}

const LARGE_CX = 264;
const LARGE_CY = 200;
const SMALL_CX = 452;
const SMALL_CY = 200;

const styles = `
  .gear-loader-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .gear-large {
    transform-origin: ${LARGE_CX}px ${LARGE_CY}px;
    animation: gear-spin-ccw 3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
  }

  .gear-small {
    transform-origin: ${SMALL_CX}px ${SMALL_CY}px;
    animation: gear-spin-cw 3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
  }

  @keyframes gear-spin-ccw {
    from { transform: rotate(0deg); }
    to   { transform: rotate(-360deg); }
  }

  @keyframes gear-spin-cw {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  @media (prefers-reduced-motion: reduce) {
    .gear-large,
    .gear-small {
      animation: none;
    }
  }

  .gear-sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;

export function GearLoader({
  size = 200,
  speed = 3,
  className = "",
  label = "Loading",
}: GearLoaderProps) {
  const largePath = useMemo(
    () => generateGearPath(LARGE_CX, LARGE_CY, 130, 100, 12, 22),
    []
  );
  const smallPath = useMemo(
    () => generateGearPath(SMALL_CX, SMALL_CY, 90, 65, 8, 16),
    []
  );

  const animDuration = `${speed}s`;

  return (
    <>
      <style>{styles}</style>
      <div
        className={`gear-loader-wrapper ${className}`}
        role="status"
        aria-label={label}
      >
        <svg
          width="100%"
          viewBox="0 0 680 400"
          xmlns="http://www.w3.org/2000/svg"
          style={{ maxWidth: size, display: "block" }}
        >
          <g
            className="gear-large"
            style={{ animationDuration: animDuration }}
          >
            <path d={largePath} fill="#E24B4A" fillRule="evenodd" />
          </g>
          <g
            className="gear-small"
            style={{ animationDuration: animDuration }}
          >
            <path d={smallPath} fill="#1D9E75" fillRule="evenodd" />
          </g>
        </svg>
        <span className="gear-sr-only">{label}...</span>
      </div>
    </>
  );
}

export default GearLoader;
