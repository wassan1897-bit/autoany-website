import { useLayoutEffect, useRef } from "react";
import { STACK_TOOLS } from "../lib/stack-tools";
import { bindLiveSection } from "../lib/live-section";
import "./GateWorkflow.css";

const CARD = 72;
/** The sink node is oversized so the graph reads as arriving somewhere. */
const HERO = 108;
const HOP_HOLD = 0;
const HOP_HANDOFF = 0.84;

/** Scroll distance, in viewport heights, that the whole graph plays over. */
const SCROLL_SPAN = 8;
/** Share of that distance spent fading the canvas in before the first wire fires. */
const LEAD_IN = 0.06;

function tool(id: (typeof STACK_TOOLS)[number]["id"]) {
  const found = STACK_TOOLS.find((item) => item.id === id);
  if (!found) throw new Error(`Missing stack tool ${id}`);
  return found;
}

/** Drawn bounds of the authored graph, labels included - they overhang the cards. */
const CONTENT = { x: 52, y: 10, w: 2628, h: 597 };
/** Extra right gutter offsets the oversized AutoAny plate so the graph doesn't read right-heavy. */
const PAD_LEFT = 80;
const PAD_RIGHT = 220;
const PAD_Y = 20;
const VIEW_X = CONTENT.x - PAD_LEFT;
const VIEW_Y = CONTENT.y - PAD_Y;
const VIEW_W = CONTENT.w + PAD_LEFT + PAD_RIGHT;
const VIEW_H = CONTENT.h + PAD_Y * 2;
const TRUNK_Y = 254;
/** Branch rows are mirrored about the trunk so the split reads as one symmetric fork. */
const UP_Y = 18;
const DOWN_Y = 490;

/** Canvas order mirrors an n8n graph: two triggers, one trunk, two mirrored branches. */
const NODES = [
  { ...tool("n8n"), id: 0, x: 60, y: 144, kind: "trigger", sub: "webhook" },
  { ...tool("make"), id: 1, x: 60, y: 364, kind: "trigger", sub: "schedule" },
  { ...tool("cursor"), id: 2, x: 250, y: TRUNK_Y, kind: "step", sub: "build", step: 1 },
  { ...tool("claude"), id: 3, x: 380, y: TRUNK_Y, kind: "step", sub: "agent", step: 2 },
  { ...tool("lovable"), id: 4, x: 510, y: TRUNK_Y, kind: "step", sub: "prototype", step: 3 },
  { ...tool("python"), id: 5, x: 640, y: TRUNK_Y, kind: "step", sub: "logic", step: 4 },
  { ...tool("fastapi"), id: 6, x: 770, y: TRUNK_Y, kind: "step", sub: "endpoint", step: 5 },
  { ...tool("aws"), id: 7, x: 900, y: TRUNK_Y, kind: "step", sub: "runtime", step: 6 },
  { ...tool("retell"), id: 8, x: 1302, y: UP_Y, kind: "step", sub: "voice agent" },
  { ...tool("vapi"), id: 9, x: 1432, y: UP_Y, kind: "step", sub: "call flow" },
  { ...tool("elevenlabs"), id: 10, x: 1562, y: UP_Y, kind: "step", sub: "speech" },
  { ...tool("azure"), id: 11, x: 1030, y: TRUNK_Y, kind: "step", sub: "runtime", step: 7 },
  { ...tool("airtable"), id: 12, x: 1302, y: DOWN_Y, kind: "step", sub: "records" },
  { ...tool("cal"), id: 13, x: 1432, y: DOWN_Y, kind: "step", sub: "booking" },
  { ...tool("calendly"), id: 14, x: 1562, y: DOWN_Y, kind: "step", sub: "booking" },
  { ...tool("twilio"), id: 15, x: 1834, y: TRUNK_Y, kind: "step", sub: "telephony", step: 8 },
  { ...tool("gohighlevel"), id: 16, x: 1964, y: TRUNK_Y, kind: "step", sub: "crm", step: 9 },
  { ...tool("hubspot"), id: 17, x: 2094, y: TRUNK_Y, kind: "step", sub: "crm", step: 10 },
  { ...tool("salesforce"), id: 18, x: 2224, y: TRUNK_Y, kind: "step", sub: "crm", step: 11 },
  { ...tool("zoho"), id: 19, x: 2354, y: TRUNK_Y, kind: "step", sub: "crm", step: 12 },
  { name: "AutoAny", src: "", id: 20, x: 2560, y: TRUNK_Y, kind: "sink", sub: "runs itself" },
] as const;

/** Frame around the runtime block, like an n8n sub-flow group. */
const FRAME = { x: 740, y: TRUNK_Y - 40, w: 392, h: 186, label: "runtime" };

type Node = (typeof NODES)[number];

function span(node: Node) {
  return node.kind === "sink" ? HERO : CARD;
}

function centerX(node: Node) {
  return node.x + CARD / 2;
}

function centerY(node: Node) {
  return node.y + CARD / 2;
}

function right(node: Node) {
  return { x: centerX(node) + span(node) / 2, y: centerY(node) };
}

function left(node: Node) {
  return { x: centerX(node) - span(node) / 2, y: centerY(node) };
}

function link(from: Node, to: Node) {
  const a = right(from);
  const b = left(to);
  const mx = (a.x + b.x) / 2;
  return `M${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`;
}

/**
 * Order drives the scroll reveal, so it reads like an execution path: triggers in,
 * down the trunk, out along both branches, then both branches merge back into the
 * trunk at Twilio. AutoAny is the last edge on purpose - the graph only completes
 * once the gate has been fully scrolled.
 */
const EDGES = [
  [0, 2],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 7],
  [7, 11],
  [11, 8],
  [8, 9],
  [9, 10],
  [11, 12],
  [12, 13],
  [13, 14],
  [10, 15],
  [14, 15],
  [15, 16],
  [16, 17],
  [17, 18],
  [18, 19],
  [19, 20],
].map(([from, to]) => ({ from, to, d: link(NODES[from], NODES[to]) }));
const EDGE_COUNT = EDGES.length;

function pathLen(el: SVGGeometryElement) {
  try {
    return Math.max(1, el.getTotalLength());
  } catch {
    return 240;
  }
}

function spacerProgress(section: Element) {
  const stage = section.closest(".open-stage") as HTMLElement | null;
  if (stage) {
    const wf = Number(stage.style.getPropertyValue("--wf") || 0);
    if (wf <= 0) return 0;
    return Math.min(1, Math.max(0, wf));
  }
  const spacer = section.nextElementSibling as HTMLElement | null;
  if (!spacer) return 0;
  const vh = window.innerHeight || 1;
  const scrolled = vh - spacer.getBoundingClientRect().top;
  return Math.min(1, Math.max(0, scrolled / (vh * SCROLL_SPAN)));
}

/** Rounded-rect path with independent left/right radii - triggers get a pill left edge. */
function plate(x: number, y: number, size: number, lr: number, rr: number) {
  return [
    `M${x + lr} ${y}`,
    `H${x + size - rr}`,
    `A${rr} ${rr} 0 0 1 ${x + size} ${y + rr}`,
    `V${y + size - rr}`,
    `A${rr} ${rr} 0 0 1 ${x + size - rr} ${y + size}`,
    `H${x + lr}`,
    `A${lr} ${lr} 0 0 1 ${x} ${y + size - lr}`,
    `V${y + lr}`,
    `A${lr} ${lr} 0 0 1 ${x + lr} ${y}`,
    "Z",
  ].join(" ");
}

function NodeCard({ node }: { node: Node }) {
  const { id, name, src, kind, sub } = node;
  const step = "step" in node ? node.step : undefined;
  const hero = kind === "sink";
  const size = span(node);
  const mid = { x: centerX(node), y: centerY(node) };
  const x = mid.x - size / 2;
  const y = mid.y - size / 2;
  const lr = kind === "trigger" ? CARD / 2 : hero ? 26 : 16;
  const rr = hero ? 26 : 16;
  const markPad = hero ? 18 : 12;
  const markScale = hero ? 2.25 : 1.5;
  const ring = plate(x - 22, y - 22, size + 44, lr + 22, rr + 22);

  return (
    <g
      className={`gate-wf-node${hero ? " gate-wf-node--hero" : ""}`}
      data-gate-node={id}
    >
      {hero ? (
        <>
          <path
            className="gate-wf-hero-halo"
            d={plate(x - 30, y - 30, size + 60, lr + 30, rr + 30)}
          />
          <path className="gate-wf-hero-ring" d={ring} />
          <path className="gate-wf-hero-pulse" d={ring} />
        </>
      ) : null}
      <path className="gate-wf-aura" d={plate(x - 8, y - 8, size + 16, lr + 8, rr + 6)} />
      <g className="gate-wf-body">
        <path className="gate-wf-card" d={plate(x, y, size, lr, rr)} />
        {step ? (
          <text className="gate-wf-index" x={x} y={y - 10}>
            {step}
          </text>
        ) : null}
        {hero ? (
          <text className="gate-wf-hero-tag" x={mid.x} y={y - 36} textAnchor="middle">
            destination
          </text>
        ) : null}
        {src ? (
          <image href={src} x={x + 8} y={y + 8} width={CARD - 16} height={CARD - 16} />
        ) : (
          <g
            className="gate-wf-brand"
            transform={`translate(${x + markPad} ${y + markPad}) scale(${markScale})`}
          >
            <path
              className="gate-wf-brand-plate"
              d="M16 2.2 L27.9 9.05 V22.95 L16 29.8 L4.1 22.95 V9.05 Z"
            />
            <path
              className="gate-wf-brand-a"
              fillRule="evenodd"
              d="M16 8.4 L24.85 25.2 H21.15 L19.55 21.35 H12.45 L10.85 25.2 H7.15 L16 8.4 ZM16 13.35 L13.55 19.05 H18.45 L16 13.35 Z"
            />
            <path
              className="gate-wf-brand-edge"
              d="M16 2.2 L27.9 9.05 V22.95 L16 29.8 L4.1 22.95 V9.05 Z"
              strokeLinejoin="round"
            />
            <circle className="gate-wf-brand-rivet" cx="16" cy="4.55" r="1.35" />
          </g>
        )}
        {hero ? <circle className="gate-wf-hero-inlet" cx={x} cy={mid.y} r="10" /> : null}
        {kind === "trigger" ? null : (
          <circle className="gate-wf-port" cx={x} cy={mid.y} r={hero ? "4.4" : "3.2"} />
        )}
        {hero ? null : <circle className="gate-wf-port" cx={x + size} cy={mid.y} r="3.2" />}
        <text
          className="gate-wf-label"
          x={mid.x}
          y={y + size + (hero ? 52 : 24)}
          textAnchor="middle"
        >
          {name}
        </text>
        <text
          className="gate-wf-sub"
          x={mid.x}
          y={y + size + (hero ? 74 : 42)}
          textAnchor="middle"
        >
          {sub}
        </text>
      </g>
    </g>
  );
}

export default function GateWorkflow() {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const section = root.closest("section") ?? root;
    const shell = root.querySelector<SVGSVGElement>(".gate-wf-svg");
    const nodes = Array.from(root.querySelectorAll<SVGGElement>("[data-gate-node]"));
    const cores = Array.from(root.querySelectorAll<SVGPathElement>("[data-gate-neon='core']"));
    const glows = Array.from(root.querySelectorAll<SVGPathElement>("[data-gate-neon='glow']"));
    const idles = Array.from(root.querySelectorAll<SVGPathElement>("[data-gate-idle]"));

    const measure = () => {
      cores.forEach((core) => {
        core.dataset.gateLen = String(pathLen(core));
      });
    };

    const apply = (raw: number) => {
      if (shell) shell.style.opacity = String(Math.min(1, raw / LEAD_IN));
      const p = Math.min(1, Math.max(0, (raw - LEAD_IN) / (1 - LEAD_IN)));
      const finished = p >= 1;
      const atRest = p <= 0;
      const scaled = p * EDGE_COUNT;
      const hop = finished ? EDGE_COUNT - 1 : Math.min(EDGE_COUNT - 1, Math.floor(scaled));
      const frac = finished ? 1 : scaled - hop;
      const edge = EDGES[hop];
      const liveId = atRest || finished ? -1 : frac < HOP_HANDOFF ? edge.from : edge.to;
      const doneIds = new Set<number>();
      if (!atRest) {
        if (finished) {
          NODES.forEach((node) => doneIds.add(node.id));
        } else {
          for (let i = 0; i < hop; i += 1) {
            doneIds.add(EDGES[i].from);
            doneIds.add(EDGES[i].to);
          }
          if (frac >= HOP_HANDOFF) doneIds.add(edge.from);
          doneIds.delete(liveId);
        }
      }

      packed.forEach(({ node, index, aura, card }) => {
        const live = index === liveId;
        const on = live || doneIds.has(index);
        node.classList.toggle("is-live", live);
        node.classList.toggle("is-on", on);
        node.style.opacity = on ? "1" : "0.2";
        if (aura) {
          aura.setAttribute("stroke", live ? "#fff" : "none");
          aura.setAttribute("stroke-width", live ? "4" : "0");
          aura.setAttribute("fill", live ? "rgba(255,255,255,0.28)" : "none");
          if (live) aura.setAttribute("filter", "url(#gate-node-neon)");
          else aura.removeAttribute("filter");
        }
        if (card) card.setAttribute("fill", on ? "#ffffff" : "#f4f2ee");
      });

      cores.forEach((core, i) => {
        const glow = glows[i];
        const idle = idles[i];
        const len = Number(core.dataset.gateLen) || pathLen(core);
        const trail = Math.min(90, Math.max(28, len * 0.14));
        const gap = Math.max(1, len - trail);
        const traveling = !atRest && !finished && i === hop && frac >= HOP_HOLD && frac < HOP_HANDOFF;
        const previous = finished || (!atRest && (i < hop || (i === hop && frac >= HOP_HANDOFF)));
        const travel = traveling ? (frac - HOP_HOLD) / (HOP_HANDOFF - HOP_HOLD) : previous ? 1 : 0;

        if (traveling) {
          core.style.strokeDasharray = `${trail} ${gap}`;
          core.style.strokeDashoffset = String(len - travel * len);
          core.style.opacity = "1";
          core.style.filter = "drop-shadow(0 0 10px #fff) drop-shadow(0 0 22px rgb(255 255 255 / 0.55))";
        } else if (previous) {
          core.style.strokeDasharray = `${len}`;
          core.style.strokeDashoffset = "0";
          core.style.opacity = "0.3";
          core.style.filter = "none";
        } else {
          core.style.strokeDasharray = `${trail} ${gap}`;
          core.style.strokeDashoffset = String(len);
          core.style.opacity = "0";
          core.style.filter = "none";
        }

        if (glow) {
          glow.style.strokeDasharray = `${trail * 1.15} ${Math.max(1, len - trail * 1.15)}`;
          glow.style.strokeDashoffset = traveling ? String(len - travel * len) : String(len);
          glow.style.opacity = traveling ? "0.68" : "0";
          glow.style.visibility = traveling ? "visible" : "hidden";
        }
        idle?.classList.toggle("is-run", previous);
      });
    };

    const packed = nodes.map((node) => ({
      node,
      index: Number(node.dataset.gateNode ?? 0),
      aura: node.querySelector<SVGPathElement>(".gate-wf-aura"),
      card: node.querySelector<SVGPathElement>(".gate-wf-card"),
    }));

    measure();

    let lastRaw = Number.NaN;
    let live = false;

    const sync = () => {
      const raw = spacerProgress(section);
      if (raw === lastRaw) return;
      lastRaw = raw;
      apply(raw);
    };

    const tick = () => {
      if (!live) return;
      sync();
    };

    const unbind = bindLiveSection(
      section,
      (next) => {
        live = next;
        if (live) sync();
      },
      { coverNext: true },
    );

    let raf = 0;
    const onScroll = () => {
      if (!live || raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        tick();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    sync();

    return () => {
      unbind();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={rootRef} className="gate-wf" aria-hidden>
      <svg
        className="gate-wf-svg"
        viewBox={`${VIEW_X} ${VIEW_Y} ${VIEW_W} ${VIEW_H}`}
        fill="none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter
            id="gate-node-neon"
            x="-40%"
            y="-40%"
            width="180%"
            height="180%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g className="gate-wf-frame">
          <rect x={FRAME.x} y={FRAME.y} width={FRAME.w} height={FRAME.h} rx="20" />
          <text x={FRAME.x + 4} y={FRAME.y - 12}>
            {FRAME.label}
          </text>
        </g>

        {EDGES.map((edge, i) => (
          <path key={`idle-${i}`} className="gate-wf-idle" d={edge.d} strokeWidth="1.7" data-gate-idle={i} />
        ))}

        {EDGES.map((edge, i) => (
          <g key={`neon-${i}`}>
            <path className="gate-wf-neon-glow" d={edge.d} strokeWidth="6.5" data-gate-neon="glow" />
            <path className="gate-wf-neon-core" d={edge.d} strokeWidth="2.4" data-gate-neon="core" />
          </g>
        ))}

        {NODES.map((node) => (
          <NodeCard key={node.id} node={node} />
        ))}
      </svg>
    </div>
  );
}
