import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scheduleScrollTriggerRefresh } from "../lib/scroll-refresh";
import { bindLiveSection } from "../lib/live-section";
import { cn } from "../lib/cn";

gsap.registerPlugin(ScrollTrigger);

type AtmosphereVariant = "hero" | "gate" | "team" | "stack";

const ATM_TUNING = {
  desktop: {
    hero: { gridY: 8, farY: 11, farX: 18, nearY: -9, nearX: -14, glowY: -6, glowScale: 1.06 },
    other: { gridY: 8, farY: 11, farX: 28, nearY: -9, nearX: -22, glowY: -6, glowScale: 1.06 },
  },
  mobile: {
    hero: { gridY: 5, farY: 6.5, farX: 10, nearY: -5.5, nearX: -8, glowY: -3.5, glowScale: 1.03 },
    other: { gridY: 5, farY: 6.8, farX: 13, nearY: -5.7, nearX: -11, glowY: -3.8, glowScale: 1.03 },
  },
} as const;

const NEON_TRAVEL = {
  gate: {
    trailRatio: 0.14,
    minTrail: 28,
    maxTrail: 108,
    coreOpacity: 0.94,
    glowOpacity: 0.54,
    fadeIn: 0.13,
    fadeOut: 0.89,
    pulse: 0.06,
  },
  team: {
    trailRatio: 0.15,
    minTrail: 30,
    maxTrail: 116,
    coreOpacity: 0.96,
    glowOpacity: 0.56,
    fadeIn: 0.11,
    fadeOut: 0.9,
    pulse: 0.05,
  },
  hero: {
    trailRatio: 0.08,
    minTrail: 18,
    maxTrail: 56,
    coreOpacity: 0.38,
    glowOpacity: 0.14,
    fadeIn: 0.22,
    fadeOut: 0.84,
    pulse: 0.025,
  },
  stack: {
    trailRatio: 0.1,
    minTrail: 20,
    maxTrail: 82,
    coreOpacity: 0.68,
    glowOpacity: 0.3,
    fadeIn: 0.17,
    fadeOut: 0.88,
    pulse: 0.03,
  },
} as const;

type NeonVariant = keyof typeof NEON_TRAVEL;

function Wire({
  d,
  at,
  dur,
  width,
  op,
  dashed,
  spark,
  neon,
}: {
  d: string;
  at: string;
  dur: string;
  width: string;
  op: string;
  dashed?: boolean;
  spark?: boolean;
  neon?: NeonVariant;
}) {
  const neonStyle = neon ? NEON_TRAVEL[neon] : null;
  const numericWidth = Number(width);
  return (
    <>
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={width}
        opacity={op}
        data-atm-draw="wire"
        data-atm-at={at}
        data-atm-dur={dur}
        data-atm-op={op}
        data-atm-dashed={dashed ? "true" : undefined}
        data-atm-neon-variant={neon}
      />
      {neon && neonStyle ? (
        <>
          <path
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={numericWidth + 1.8}
            opacity="0"
            strokeLinecap="round"
            data-atm-neon="glow"
            data-atm-neon-variant={neon}
            data-atm-neon-op={String(neonStyle.glowOpacity)}
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={d}
            fill="none"
            stroke="currentColor"
            strokeWidth={numericWidth + 0.2}
            opacity="0"
            strokeLinecap="round"
            data-atm-neon="core"
            data-atm-neon-variant={neon}
            data-atm-neon-op={String(neonStyle.coreOpacity)}
            vectorEffect="non-scaling-stroke"
          />
        </>
      ) : null}
      {spark ? (
        <path
          d={d}
          fill="none"
          stroke="currentColor"
          strokeWidth={Number(width) + 0.35}
          opacity="0"
          data-atm-draw="spark"
        />
      ) : null}
    </>
  );
}

function Node({
  cx,
  cy,
  r,
  at,
  op,
}: {
  cx: string;
  cy: string;
  r: string;
  at: string;
  op: string;
}) {
  return (
    <circle
      className="atm-node"
      cx={cx}
      cy={cy}
      r={r}
      fill="currentColor"
      opacity={op}
      data-atm-draw="node"
      data-atm-at={at}
      data-atm-op={op}
      data-atm-r={r}
    />
  );
}

function n8nCurve(x1: number, y1: number, x2: number, y2: number) {
  const mx = (x1 + x2) / 2;
  return `M${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
}

function PlateNode({
  x,
  y,
  size = 11,
  at,
  op,
}: {
  x: number;
  y: number;
  size?: number;
  at: string;
  op: string;
}) {
  return (
    <rect
      className="atm-node atm-node--plate"
      x={x - size / 2}
      y={y - size / 2}
      width={size}
      height={size}
      rx={Math.min(3.2, size * 0.22)}
      fill="currentColor"
      opacity={op}
      data-atm-draw="node"
      data-atm-at={at}
      data-atm-op={op}
    />
  );
}

function Frame({
  x,
  y,
  w,
  h,
  at,
  dur,
  op,
}: {
  x: string;
  y: string;
  w: string;
  h: string;
  at: string;
  dur: string;
  op: string;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx="6"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.85"
      opacity={op}
      data-atm-draw="frame"
      data-atm-at={at}
      data-atm-dur={dur}
      data-atm-op={op}
    />
  );
}

function WireLabel({
  x,
  y,
  at,
  op,
  children,
  anchor = "start",
}: {
  x: string;
  y: string;
  at: string;
  op: string;
  children: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      className="atm-wire-label"
      x={x}
      y={y}
      fill="currentColor"
      opacity={op}
      textAnchor={anchor}
      fontSize="11"
      data-atm-draw="label"
      data-atm-at={at}
      data-atm-op={op}
    >
      {children}
    </text>
  );
}

function HeroConstellation({ layer }: { layer: "far" | "near" }) {
  const far = layer === "far";
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 1440 900"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {far ? (
        <>
          <Wire d={n8nCurve(64, 96, 196, 96)} at="0.2" dur="2.2" width="0.75" op="0.2" neon="hero" />
          <Wire d={n8nCurve(196, 96, 314, 138)} at="1.6" dur="1.8" width="0.7" op="0.16" />
          <Wire d={n8nCurve(1008, 84, 1164, 84)} at="0.8" dur="2.0" width="0.75" op="0.22" neon="hero" />
          <Wire d={n8nCurve(1164, 84, 1328, 132)} at="2.4" dur="1.8" width="0.7" op="0.18" dashed />
          <Wire d={n8nCurve(1088, 248, 1256, 276)} at="4.2" dur="1.8" width="0.65" op="0.16" />
          <PlateNode x={64} y={96} size={14} at="0.1" op="0.28" />
          <PlateNode x={196} y={96} size={16} at="1.4" op="0.32" />
          <PlateNode x={314} y={138} size={13} at="3.0" op="0.24" />
          <PlateNode x={1008} y={84} size={15} at="0.6" op="0.3" />
          <PlateNode x={1164} y={84} size={17} at="2.2" op="0.36" />
          <PlateNode x={1328} y={132} size={13} at="3.8" op="0.26" />
          <PlateNode x={1256} y={276} size={13} at="5.4" op="0.22" />
          <Frame x="992" y="58" w="360" h="100" at="1.8" dur="1.6" op="0.14" />
        </>
      ) : (
        <>
          <Wire d={n8nCurve(992, 428, 1152, 428)} at="0.6" dur="2.2" width="0.85" op="0.26" neon="hero" />
          <Wire d={n8nCurve(1152, 428, 1316, 428)} at="2.2" dur="1.8" width="0.8" op="0.24" />
          <Wire d={n8nCurve(1152, 428, 1310, 328)} at="3.4" dur="2.0" width="0.75" op="0.22" />
          <Wire d={n8nCurve(1152, 428, 1308, 556)} at="4.0" dur="2.0" width="0.75" op="0.22" dashed neon="hero" />
          <Wire d={n8nCurve(1056, 704, 1216, 704)} at="5.2" dur="1.8" width="0.8" op="0.24" spark />
          <Wire d={n8nCurve(1216, 704, 1356, 752)} at="6.6" dur="1.6" width="0.75" op="0.2" />
          <PlateNode x={992} y={428} size={16} at="0.5" op="0.32" />
          <PlateNode x={1152} y={428} size={18} at="2.0" op="0.4" />
          <PlateNode x={1316} y={428} size={16} at="3.6" op="0.3" />
          <PlateNode x={1310} y={328} size={14} at="4.8" op="0.26" />
          <PlateNode x={1308} y={556} size={14} at="5.4" op="0.26" />
          <PlateNode x={1056} y={704} size={16} at="5.0" op="0.3" />
          <PlateNode x={1216} y={704} size={17} at="6.4" op="0.36" />
          <PlateNode x={1356} y={752} size={13} at="7.8" op="0.24" />
          <Frame x="1120" y="304" w="228" h="276" at="3.0" dur="1.6" op="0.16" />
        </>
      )}
    </svg>
  );
}

function Constellation({ layer }: { layer: "far" | "near" }) {
  const far = layer === "far";
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 1440 900"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {far ? (
        <>
          <Wire d="M120 210h190l70 86v120l-64 48H160l-40-70V210Z" at="0.25" dur="2.8" width="0.8" op="0.28" neon="gate" />
          <Wire d="M980 140h210v90l-48 62H1028l-48-62V140Z" at="5.9" dur="2.6" width="0.8" op="0.22" neon="gate" />
          <Wire d="M310 210 C 430 168, 520 176, 610 240" at="2.5" dur="2.2" width="0.7" op="0.34" neon="gate" />
          <Wire d="M610 240 C 740 310, 820 280, 980 186" at="4.6" dur="2.3" width="0.7" op="0.28" dashed neon="gate" />
          <Wire d="M160 464 C 280 520, 420 500, 540 430" at="7.8" dur="2.4" width="0.7" op="0.26" neon="gate" />
          <Node cx="120" cy="210" r="3.2" at="0" op="0.45" />
          <Node cx="380" cy="296" r="2.4" at="1.4" op="0.35" />
          <Node cx="610" cy="240" r="3.6" at="4.4" op="0.5" />
          <Node cx="980" cy="186" r="2.8" at="6.6" op="0.4" />
          <Node cx="1190" cy="140" r="2.2" at="7.8" op="0.3" />
          <Node cx="160" cy="464" r="2.6" at="7.8" op="0.32" />
          <Node cx="540" cy="430" r="3" at="9.6" op="0.38" />
          <Frame x="248" y="188" w="72" h="28" at="1.6" dur="1.5" op="0.3" />
          <Frame x="868" y="214" w="84" h="28" at="5.2" dur="1.4" op="0.26" />
        </>
      ) : (
        <>
          <Wire d="M220 620h140l46 54v88H248l-28-42V620Z" at="2.6" dur="2.6" width="1" op="0.42" neon="gate" />
          <Wire d="M720 540h168v72l-36 44H756l-36-44V540Z" at="4.4" dur="2.4" width="1" op="0.38" neon="gate" />
          <Wire d="M1088 610h154l38 70v96h-192l-28-54V610Z" at="6.8" dur="2.8" width="1" op="0.34" neon="gate" />
          <Wire d="M360 674 C 490 710, 610 690, 720 576" at="5.0" dur="2.2" width="0.9" op="0.44" spark neon="gate" />
          <Wire d="M888 612 C 980 640, 1040 650, 1088 646" at="7.2" dur="2.0" width="0.9" op="0.4" dashed neon="gate" />
          <Wire d="M720 540 C 680 430, 760 360, 860 318" at="8.6" dur="2.4" width="0.85" op="0.32" neon="gate" />
          <Node cx="220" cy="620" r="3.8" at="2.4" op="0.55" />
          <Node cx="406" cy="674" r="3" at="5.0" op="0.48" />
          <Node cx="720" cy="540" r="4.2" at="6.6" op="0.58" />
          <Node cx="888" cy="612" r="2.8" at="8.4" op="0.46" />
          <Node cx="1088" cy="646" r="3.4" at="9.0" op="0.5" />
          <Node cx="1242" cy="610" r="2.6" at="9.6" op="0.4" />
          <Node cx="860" cy="318" r="3.2" at="10.4" op="0.44" />
          <Frame x="548" y="628" w="78" h="26" at="5.4" dur="1.4" op="0.4" />
          <Frame x="990" y="572" w="70" h="26" at="7.6" dur="1.3" op="0.36" />
        </>
      )}
    </svg>
  );
}

function TeamConstellation({ layer }: { layer: "far" | "near" }) {
  const far = layer === "far";
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 1440 900"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {far ? (
        <>
          <Wire d="M144 320 L288 320 L330 420 L216 480 L102 420Z" at="0.2" dur="3.2" width="0.7" op="0.2" neon="team" />
          <Wire d="M432 180 L576 180 L618 280 L504 340 L390 280Z" at="1.8" dur="3.0" width="0.7" op="0.18" neon="team" />
          <Wire d="M720 260 L864 260 L906 360 L792 420 L678 360Z" at="3.4" dur="2.8" width="0.7" op="0.22" neon="team" />
          <Wire d="M1008 160 L1152 160 L1194 260 L1080 320 L966 260Z" at="5.0" dur="3.0" width="0.7" op="0.2" neon="team" />
          <Wire d="M1200 380 L1344 380 L1386 480 L1272 540 L1158 480Z" at="6.6" dur="2.8" width="0.7" op="0.18" neon="team" />
          <Wire d="M288 320 C 360 250, 400 220, 432 180" at="2.8" dur="1.8" width="0.6" op="0.26" dashed neon="team" />
          <Wire d="M618 280 C 660 300, 690 280, 720 260" at="4.2" dur="1.4" width="0.6" op="0.24" neon="team" />
          <Wire d="M906 360 C 940 310, 970 280, 1008 260" at="6.0" dur="1.6" width="0.6" op="0.22" spark neon="team" />
          <Wire d="M1194 260 C 1210 320, 1200 360, 1200 380" at="7.4" dur="1.2" width="0.6" op="0.2" neon="team" />
          <Wire d="M216 480 C 320 540, 440 520, 504 340" at="8.2" dur="2.2" width="0.5" op="0.16" neon="team" />
          <Wire d="M792 420 C 900 500, 1020 460, 1080 320" at="9.4" dur="2.0" width="0.5" op="0.18" neon="team" />
          <Node cx="216" cy="400" r="4" at="0.6" op="0.5" />
          <Node cx="504" cy="260" r="4" at="2.2" op="0.48" />
          <Node cx="792" cy="340" r="4.4" at="3.8" op="0.52" />
          <Node cx="1080" cy="240" r="4" at="5.4" op="0.48" />
          <Node cx="1272" cy="460" r="3.8" at="7.0" op="0.46" />
          <Node cx="102" cy="420" r="2" at="1.0" op="0.28" />
          <Node cx="618" cy="280" r="2.2" at="4.6" op="0.3" />
          <Node cx="1386" cy="480" r="2" at="8.0" op="0.26" />
          <Frame x="320" y="360" w="60" h="22" at="2.0" dur="1.4" op="0.22" />
          <Frame x="920" y="300" w="60" h="22" at="5.8" dur="1.4" op="0.2" />
        </>
      ) : (
        <>
          <Wire d="M80 680h200l60 80v60H120l-40-60V680Z" at="1.0" dur="2.6" width="0.9" op="0.32" neon="team" />
          <Wire d="M480 600h180v70l-40 50H520l-40-50V600Z" at="3.0" dur="2.4" width="0.9" op="0.3" neon="team" />
          <Wire d="M840 640h160l32 60v80H860l-20-40V640Z" at="5.0" dur="2.6" width="0.9" op="0.28" neon="team" />
          <Wire d="M1160 580h200v80l-40 60h-120l-40-60V580Z" at="7.0" dur="2.4" width="0.9" op="0.3" neon="team" />
          <Wire d="M280 760 C 380 800, 440 740, 480 600" at="4.0" dur="2.0" width="0.8" op="0.36" spark neon="team" />
          <Wire d="M660 670 C 740 720, 800 700, 840 640" at="6.0" dur="1.8" width="0.8" op="0.34" neon="team" />
          <Wire d="M1032 780 C 1080 740, 1120 700, 1160 620" at="8.0" dur="1.8" width="0.8" op="0.32" dashed neon="team" />
          <Node cx="180" cy="720" r="3.6" at="1.4" op="0.52" />
          <Node cx="570" cy="640" r="3.4" at="3.4" op="0.5" />
          <Node cx="920" cy="680" r="3.8" at="5.4" op="0.54" />
          <Node cx="1260" cy="620" r="3.4" at="7.4" op="0.5" />
          <Node cx="380" cy="800" r="2.4" at="4.4" op="0.36" />
          <Node cx="1032" cy="780" r="2.6" at="8.4" op="0.38" />
          <Frame x="620" y="700" w="70" h="24" at="4.8" dur="1.3" op="0.32" />
          <Frame x="1080" y="640" w="66" h="24" at="7.8" dur="1.3" op="0.28" />
        </>
      )}
    </svg>
  );
}

function StackConstellation({ layer }: { layer: "far" | "near" }) {
  const far = layer === "far";
  return (
    <svg
      className="h-full w-full"
      viewBox="0 0 1440 900"
      fill="none"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {far ? (
        <>
          <Wire d="M96 158h168l62 76v104l-56 42H136l-40-62V158Z" at="0.25" dur="2.8" width="0.8" op="0.26" neon="stack" />
          <Wire d="M1072 122h196v84l-46 56H1120l-48-56V122Z" at="5.7" dur="2.6" width="0.8" op="0.22" neon="stack" />
          <Wire d="M326 234 C 338 246, 346 252, 356 257" at="1.4" dur="1.2" width="0.7" op="0.3" neon="stack" />
          <Wire d="M326 158 C 520 72, 860 64, 1072 122" at="3.2" dur="2.4" width="0.7" op="0.22" dashed neon="stack" />
          <Wire d="M136 404 C 148 428, 142 444, 128 456" at="2.4" dur="1.6" width="0.65" op="0.24" neon="stack" />
          <Wire d="M1222 262 C 1268 312, 1284 348, 1288 380" at="7.2" dur="1.8" width="0.65" op="0.22" neon="stack" />
          <Node cx="96" cy="158" r="3.2" at="0" op="0.44" />
          <WireLabel x="110" y="152" at="0.12" op="0.56">n8n</WireLabel>
          <Node cx="356" cy="257" r="2.8" at="1.5" op="0.4" />
          <WireLabel x="368" y="262" at="1.65" op="0.5">Go High Level</WireLabel>
          <Node cx="1072" cy="122" r="2.8" at="5.6" op="0.4" />
          <WireLabel x="1084" y="116" at="5.75" op="0.52">Make.com</WireLabel>
          <Node cx="1268" cy="206" r="2.6" at="6.6" op="0.38" />
          <WireLabel x="1280" y="200" at="6.75" op="0.5">Hubspot</WireLabel>
          <Node cx="128" cy="456" r="2.8" at="2.8" op="0.38" />
          <WireLabel x="142" y="460" at="2.95" op="0.48">Retell AI</WireLabel>
          <Node cx="1288" cy="380" r="3" at="8.2" op="0.4" />
          <WireLabel x="1276" y="374" at="8.35" op="0.5" anchor="end">Salesforce</WireLabel>
          <Node cx="326" cy="234" r="2.2" at="1.3" op="0.32" />
          <Frame x="348" y="244" w="128" h="26" at="1.6" dur="1.5" op="0.26" />
          <Frame x="1188" y="358" w="92" h="26" at="7.8" dur="1.4" op="0.22" />
        </>
      ) : (
        <>
          <Wire d="M172 616h146l48 56v90H200l-28-44V616Z" at="2.5" dur="2.6" width="1" op="0.36" neon="stack" />
          <Wire d="M1130 528h164v68l-38 46H1164l-34-46V528Z" at="4.4" dur="2.4" width="1" op="0.34" neon="stack" />
          <Wire d="M1048 708h168l40 60v86H1074l-26-48V708Z" at="6.8" dur="2.6" width="0.95" op="0.32" neon="stack" />
          <Wire d="M366 672 C 430 792, 478 804, 512 792" at="4.8" dur="2.0" width="0.85" op="0.36" spark neon="stack" />
          <Wire d="M200 762 C 156 786, 134 802, 118 812" at="3.6" dur="1.6" width="0.8" op="0.32" dashed neon="stack" />
          <Wire d="M1294 596 C 1318 638, 1324 664, 1314 682" at="5.6" dur="1.6" width="0.85" op="0.34" neon="stack" />
          <Wire d="M512 792 C 680 860, 820 854, 916 802" at="7.4" dur="2.2" width="0.8" op="0.3" neon="stack" />
          <Wire d="M1216 854 C 1160 848, 1088 830, 1048 708" at="8.6" dur="1.8" width="0.8" op="0.28" dashed neon="stack" />
          <Node cx="172" cy="616" r="3.6" at="2.4" op="0.52" />
          <WireLabel x="186" y="610" at="2.55" op="0.58">VAPI</WireLabel>
          <Node cx="366" cy="762" r="3" at="5.0" op="0.46" />
          <Node cx="512" cy="792" r="3.2" at="5.8" op="0.5" />
          <WireLabel x="524" y="806" at="5.95" op="0.56">Airtable</WireLabel>
          <Node cx="118" cy="812" r="2.8" at="4.0" op="0.44" />
          <WireLabel x="132" y="826" at="4.15" op="0.54">cal.com</WireLabel>
          <Node cx="1130" cy="528" r="3.4" at="4.3" op="0.5" />
          <WireLabel x="1144" y="522" at="4.45" op="0.56">Calendly</WireLabel>
          <Node cx="1314" cy="682" r="3" at="6.4" op="0.46" />
          <WireLabel x="1302" y="676" at="6.55" op="0.54" anchor="end">Twilio</WireLabel>
          <Node cx="1048" cy="708" r="3.2" at="6.7" op="0.48" />
          <WireLabel x="1060" y="702" at="6.85" op="0.54">ElevenLabs</WireLabel>
          <Node cx="916" cy="802" r="3" at="7.8" op="0.46" />
          <Node cx="1216" cy="854" r="3.2" at="9.2" op="0.48" />
          <WireLabel x="1228" y="848" at="9.35" op="0.52">zoho crm</WireLabel>
          <Node cx="1294" cy="596" r="2.4" at="5.4" op="0.36" />
          <Frame x="430" y="748" w="78" h="24" at="5.2" dur="1.3" op="0.34" />
          <Frame x="1188" y="640" w="70" h="24" at="6.0" dur="1.3" op="0.3" />
        </>
      )}
    </svg>
  );
}

function pathLen(el: SVGGeometryElement) {
  try {
    return Math.max(1, el.getTotalLength());
  } catch {
    return 240;
  }
}

function playWireDraw(root: HTMLElement, variant: AtmosphereVariant) {
  const wires = gsap.utils.toArray<SVGPathElement>(root.querySelectorAll('[data-atm-draw="wire"]'));
  const frames = gsap.utils.toArray<SVGGeometryElement>(root.querySelectorAll('[data-atm-draw="frame"]'));
  const nodes = gsap.utils.toArray<SVGGraphicsElement>(root.querySelectorAll('[data-atm-draw="node"]'));
  const labels = gsap.utils.toArray<SVGTextElement>(root.querySelectorAll('[data-atm-draw="label"]'));
  const sparks = gsap.utils.toArray<SVGPathElement>(root.querySelectorAll('[data-atm-draw="spark"]'));

  const scale = variant === "hero" ? 1.28 : variant === "team" ? 1.15 : variant === "stack" ? 1.08 : 1;
  const sparkOp = variant === "hero" ? 0.1 : variant === "team" ? 0.3 : variant === "stack" ? 0.26 : 0.38;
  const fadeTo = variant === "hero" ? 0.2 : variant === "team" ? 0.04 : variant === "stack" ? 0.1 : 0.06;

  const wireMeta = wires.map((wire) => ({ el: wire, len: pathLen(wire) }));
  const frameMeta = frames.map((frame) => ({ el: frame, len: pathLen(frame) }));
  const sparkMeta = sparks.map((spark) => ({ el: spark, len: pathLen(spark) }));

  for (const { el, len } of wireMeta) {
    gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
  }
  for (const { el, len } of frameMeta) {
    gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
  }
  gsap.set(nodes, { scale: 0.15, opacity: 0 });
  gsap.set(labels, { opacity: 0 });
  for (const { el, len } of sparkMeta) {
    gsap.set(el, {
      opacity: 0,
      strokeDasharray: `${len * 0.08} ${len * 0.92}`,
      strokeDashoffset: 0,
    });
  }

  const tl = gsap.timeline({
    repeat: -1,
    defaults: { ease: "none" },
  });

  tl.set(nodes, { scale: 0.15, opacity: 0 }, 0);
  tl.set(labels, { opacity: 0 }, 0);
  for (const { el, len } of [...wireMeta, ...frameMeta]) {
    tl.set(el, { strokeDasharray: len, strokeDashoffset: len }, 0);
  }
  for (const { el } of sparkMeta) {
    tl.set(el, { opacity: 0, strokeDashoffset: 0 }, 0);
  }

  for (const { el, len } of wireMeta) {
    const at = Number(el.dataset.atmAt ?? 0) * scale;
    const dur = Number(el.dataset.atmDur ?? 2) * scale;
    const op = Number(el.dataset.atmOp ?? 0.3);
    tl.fromTo(
      el,
      { strokeDashoffset: len, opacity: op },
      { strokeDashoffset: 0, opacity: op, duration: dur },
      at,
    );
    if (el.dataset.atmDashed === "true") {
      tl.set(el, { strokeDasharray: "5 7" }, at + dur);
    }
  }

  for (const { el, len } of frameMeta) {
    const at = Number(el.dataset.atmAt ?? 0) * scale;
    const dur = Number(el.dataset.atmDur ?? 1.4) * scale;
    const op = Number(el.dataset.atmOp ?? 0.3);
    tl.fromTo(
      el,
      { strokeDashoffset: len, opacity: op },
      { strokeDashoffset: 0, opacity: op, duration: dur },
      at,
    );
  }

  for (const node of nodes) {
    const at = Number(node.dataset.atmAt ?? 0) * scale;
    const op = Number(node.dataset.atmOp ?? 0.4);
    tl.fromTo(
      node,
      { scale: 0.15, opacity: 0 },
      { scale: 1, opacity: op, duration: 0.5, ease: "power2.out" },
      at,
    );
  }

  for (const label of labels) {
    const at = Number(label.dataset.atmAt ?? 0) * scale;
    const op = Number(label.dataset.atmOp ?? 0.5);
    tl.fromTo(
      label,
      { opacity: 0 },
      { opacity: op, duration: 0.55, ease: "power2.out" },
      at,
    );
  }

  const pulseAt = 11.2 * scale;
  for (const { el, len } of sparkMeta) {
    tl.to(el, { opacity: sparkOp, duration: 0.4, ease: "power1.out" }, pulseAt);
    tl.fromTo(
      el,
      { strokeDashoffset: 0 },
      { strokeDashoffset: -len, duration: 5.4 * scale, ease: "none" },
      pulseAt + 0.15,
    );
    tl.to(el, { opacity: 0, duration: 0.7, ease: "power1.in" }, pulseAt + 4.8 * scale);
  }

  const fadeAt = 17.2 * scale;
  tl.to(
    [...wires, ...frames, ...nodes, ...labels],
    { opacity: fadeTo, duration: 1.5, ease: "power1.inOut" },
    fadeAt,
  );
  for (const { el, len } of [...wireMeta, ...frameMeta]) {
    tl.set(el, { strokeDasharray: len, strokeDashoffset: len }, fadeAt + 1.55);
  }

  return tl;
}

function setupNeonTravel(root: HTMLElement, section: Element, variant: AtmosphereVariant) {
  const pageWide = root.classList.contains("atm-root--wires");
  const neonPaths = gsap.utils.toArray<SVGPathElement>(
    root.querySelectorAll('[data-atm-neon="core"], [data-atm-neon="glow"]'),
  );
  if (!neonPaths.length) return null;

  const neonMeta = neonPaths.map((path) => {
    const len = pathLen(path);
    const neonVariant = (path.dataset.atmNeonVariant as keyof typeof NEON_TRAVEL | undefined) ?? variant;
    const config = NEON_TRAVEL[neonVariant] ?? NEON_TRAVEL.gate;
    const trail = gsap.utils.clamp(config.minTrail, config.maxTrail, len * config.trailRatio);
    const rawOp = Number(path.dataset.atmNeonOp ?? 0.72);
    const opacity = neonVariant === "hero" ? rawOp : Math.max(0.72, rawOp);
    return { path, len, trail, opacity, config };
  });

  for (const { path, len, trail } of neonMeta) {
    const gap = Math.max(1, len - trail);
    gsap.set(path, {
      strokeDasharray: `${trail} ${gap}`,
      strokeDashoffset: len,
      opacity: 0,
    });
  }
  const trigger = ScrollTrigger.create({
    trigger: section,
    start: pageWide ? "top top" : "top bottom",
    end: pageWide ? "bottom bottom" : "bottom top",
    scrub: 0.8,
    onUpdate: (self) => {
      const progress = self.progress;
      const velocityNorm = gsap.utils.clamp(0, 1, Math.abs(self.getVelocity()) / 2300);
      for (const { path, len, opacity, config } of neonMeta) {
        const travel = len;
        const fadeIn = gsap.utils.clamp(0.0001, 0.49, config.fadeIn);
        const fadeOut = gsap.utils.clamp(0.51, 0.9999, config.fadeOut);
        const lead = gsap.utils.clamp(0, 1, progress / fadeIn);
        const tail = gsap.utils.clamp(0, 1, (1 - progress) / (1 - fadeOut));
        const envelope = Math.min(lead, tail);
        const pulse = 1 + Math.sin(progress * Math.PI * 6) * config.pulse;
        const activeOpacity = opacity * envelope * (0.78 + velocityNorm * 0.3) * pulse;
        gsap.set(path, {
          strokeDashoffset: len - progress * travel,
          opacity: activeOpacity,
        });
      }
    },
    onLeave: () => {
      for (const { path } of neonMeta) {
        gsap.set(path, { opacity: 0 });
      }
    },
    onLeaveBack: () => {
      for (const { path } of neonMeta) {
        gsap.set(path, { opacity: 0 });
      }
    },
  });

  return trigger;
}

function revealPageWires(root: HTMLElement) {
  const wires = gsap.utils.toArray<SVGPathElement>(
    root.querySelectorAll('[data-atm-draw="wire"]'),
  );
  for (const el of wires) {
    const op = Number(el.dataset.atmOp ?? 0.32);
    gsap.set(el, {
      strokeDasharray: el.dataset.atmDashed === "true" ? "5 7" : "none",
      strokeDashoffset: 0,
      opacity: op,
    });
  }
}

function setupPageWireNeon(root: HTMLElement, variant: AtmosphereVariant) {
  const neonPaths = gsap.utils.toArray<SVGPathElement>(
    root.querySelectorAll('[data-atm-neon="core"], [data-atm-neon="glow"]'),
  );
  const tweens: gsap.core.Tween[] = [];
  for (const path of neonPaths) {
    const len = pathLen(path);
    const neonVariant =
      (path.dataset.atmNeonVariant as NeonVariant | undefined) ?? variant;
    const config = NEON_TRAVEL[neonVariant] ?? NEON_TRAVEL.gate;
    const trail = gsap.utils.clamp(
      config.minTrail,
      config.maxTrail,
      len * config.trailRatio,
    );
    const opacity = Math.max(0.58, Number(path.dataset.atmNeonOp ?? 0.72));
    gsap.set(path, {
      strokeDasharray: `${trail} ${Math.max(1, len - trail)}`,
      strokeDashoffset: 0,
      opacity,
    });
    tweens.push(
      gsap.to(path, {
        strokeDashoffset: -len,
        duration: neonVariant === "stack" ? 9.5 : 7.2,
        ease: "none",
        repeat: -1,
      }),
    );
  }
  return {
    kill: () => tweens.forEach((tween) => tween.kill()),
    pause: () => tweens.forEach((tween) => tween.pause()),
    resume: () => tweens.forEach((tween) => tween.resume()),
  };
}

export default function ScrollAtmosphere({
  variant,
  draw = true,
  className,
}: {
  variant: AtmosphereVariant;
  draw?: boolean;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FORCE_NEON = !reduceMotion;

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pageWires = root.classList.contains("atm-root--wires");
    const section = pageWires
      ? document.documentElement
      : (root.closest("section") ?? root);
    const work = document.getElementById("work");
    const pinToWork = !pageWires && variant !== "stack" && Boolean(work);
    const grid = root.querySelector<HTMLElement>("[data-atm='grid']");
    const far = root.querySelector<HTMLElement>("[data-atm='far']");
    const near = root.querySelector<HTMLElement>("[data-atm='near']");
    const glow = root.querySelector<HTMLElement>("[data-atm='glow']");
    if (!grid || !far || !near || !glow) return;

    const tweens: gsap.core.Tween[] = [];
    if (pageWires) {
      tweens.push(
        gsap.to(far, { yPercent: 5, x: 12, duration: 22, yoyo: true, repeat: -1, ease: "sine.inOut" }),
        gsap.to(near, { yPercent: -4, x: -10, duration: 16, yoyo: true, repeat: -1, ease: "sine.inOut" }),
        gsap.to(glow, { yPercent: -3, scale: 1.04, duration: 20, yoyo: true, repeat: -1, ease: "sine.inOut" }),
      );
    } else if (!reduce) {
      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const byViewport = isMobile ? ATM_TUNING.mobile : ATM_TUNING.desktop;
      const tuning = variant === "hero" ? byViewport.hero : byViewport.other;
      const common = {
        ease: "none" as const,
        force3D: true,
        autoRound: false,
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          endTrigger: pinToWork ? work : section,
          end: pinToWork ? "top 40%" : "bottom top",
          scrub: variant === "hero" ? 1.65 : variant === "gate" ? 1.2 : 1.35,
        },
      };
      tweens.push(
        gsap.to(grid, {
          yPercent: tuning.gridY,
          ease: common.ease,
          force3D: common.force3D,
          autoRound: common.autoRound,
          scrollTrigger: { ...common.scrollTrigger, invalidateOnRefresh: true },
        }),
        gsap.to(far, {
          yPercent: tuning.farY,
          x: tuning.farX,
          ease: common.ease,
          force3D: common.force3D,
          autoRound: common.autoRound,
          scrollTrigger: { ...common.scrollTrigger, scrub: variant === "gate" ? 1.36 : 1.8, invalidateOnRefresh: true },
        }),
        gsap.to(near, {
          yPercent: tuning.nearY,
          x: tuning.nearX,
          ease: common.ease,
          force3D: common.force3D,
          autoRound: common.autoRound,
          scrollTrigger: { ...common.scrollTrigger, scrub: variant === "gate" ? 1.12 : 1.4, invalidateOnRefresh: true },
        }),
        gsap.to(glow, {
          yPercent: tuning.glowY,
          scale: tuning.glowScale,
          ease: common.ease,
          force3D: common.force3D,
          autoRound: common.autoRound,
          scrollTrigger: { ...common.scrollTrigger, scrub: variant === "gate" ? 1.55 : 1.95, invalidateOnRefresh: true },
        }),
      );
    }

    let drawTl: gsap.core.Timeline | null = null;
    let neonTrigger: ScrollTrigger | null = null;
    let pageNeon: ReturnType<typeof setupPageWireNeon> | null = null;
    let isPaused = false;

    const liveDraw = variant === "stack" || variant === "hero";

    const setPaused = (paused: boolean) => {
      root.classList.toggle("atm-root--offscreen", paused);
      if (isPaused === paused) return;
      isPaused = paused;
      root.classList.toggle("atm-root--paused", paused);
      tweens.forEach((tween) => {
        if (paused) {
          tween.scrollTrigger?.disable(false);
          tween.pause();
        } else {
          tween.scrollTrigger?.enable();
          tween.resume();
        }
      });
      if (paused) {
        drawTl?.pause();
        neonTrigger?.disable(false);
        pageNeon?.pause();
      } else {
        drawTl?.play();
        neonTrigger?.enable();
        pageNeon?.resume();
      }
    };

    if (pageWires) {
      revealPageWires(root);
      if (draw && (!reduce || FORCE_NEON)) {
        pageNeon = setupPageWireNeon(root, variant);
      }
    } else {
      if (draw && (!reduce || liveDraw)) {
        drawTl = playWireDraw(root, variant);
        if (liveDraw) drawTl.play();
        else drawTl.pause();
      }
      if (draw && (variant === "gate" || variant === "team" || variant === "stack" || variant === "hero") && (!reduce || FORCE_NEON)) {
        neonTrigger = setupNeonTravel(root, section, variant);
      }
    }

    const wireHost =
      pageWires
        ? (document.querySelector(".open-track") as HTMLElement | null) ??
          (document.querySelector("main") as HTMLElement | null) ??
          root
        : section;

    const unbind = bindLiveSection(
      wireHost,
      (live) => setPaused(!live),
      {
        coverNext: pageWires || variant === "hero" || variant === "gate",
        mark: false,
      },
    );

    scheduleScrollTriggerRefresh();

    return () => {
      unbind();
      pageNeon?.kill();
      drawTl?.kill();
      neonTrigger?.kill();
      tweens.forEach((tween) => {
        tween.scrollTrigger?.kill();
        tween.kill();
      });
    };
  }, [variant, draw]);

  return (
    <div
      ref={rootRef}
      className={cn(
        "atm-root",
        variant === "hero" && "atm-root--hero",
        variant === "stack" && "atm-root--stack",
        reduceMotion && variant !== "stack" && variant !== "hero" && !className?.includes("atm-root--wires")
          ? "atm-root--reduced"
          : undefined,
        FORCE_NEON ? "atm-root--force-neon" : undefined,
        className,
      )}
      aria-hidden
    >
      <div data-atm="grid" className="atm-grid" />
      <div data-atm="glow" className="atm-glow" />
      <div data-atm="far" className="atm-layer atm-layer--far">
        {variant === "team" ? (
          <TeamConstellation layer="far" />
        ) : variant === "stack" ? (
          <StackConstellation layer="far" />
        ) : variant === "hero" ? (
          <HeroConstellation layer="far" />
        ) : (
          <Constellation layer="far" />
        )}
      </div>
      <div data-atm="near" className="atm-layer atm-layer--near">
        {variant === "team" ? (
          <TeamConstellation layer="near" />
        ) : variant === "stack" ? (
          <StackConstellation layer="near" />
        ) : variant === "hero" ? (
          <HeroConstellation layer="near" />
        ) : (
          <Constellation layer="near" />
        )}
      </div>
    </div>
  );
}
