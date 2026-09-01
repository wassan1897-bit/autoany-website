import { useEffect, useRef } from "react";
import "./AutomationField.css";

type Mark = "play" | "box" | "dot";

type FieldNode = {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  mark: Mark;
  live?: boolean;
};

type FieldEdge = {
  from: string;
  to: string;
  flow?: "a" | "b" | "c";
};

const NH = 42;

const NODES: FieldNode[] = [
  { id: "webhook", x: 56, y: 64, w: 136, h: NH, label: "Webhook", mark: "play" },
  { id: "n8n", x: 280, y: 64, w: 128, h: NH, label: "n8n", mark: "box", live: true },
  { id: "voice", x: 500, y: 64, w: 128, h: NH, label: "Voice", mark: "play" },
  { id: "ghl", x: 740, y: 64, w: 128, h: NH, label: "GHL", mark: "box", live: true },
  { id: "slack", x: 980, y: 64, w: 128, h: NH, label: "Slack", mark: "dot" },
  { id: "done", x: 1220, y: 64, w: 120, h: NH, label: "Done", mark: "dot" },

  { id: "agent", x: 280, y: 230, w: 128, h: NH, label: "Agent", mark: "box" },
  { id: "crm", x: 740, y: 230, w: 128, h: NH, label: "CRM", mark: "box" },
  { id: "sheet", x: 980, y: 230, w: 128, h: NH, label: "Sheet", mark: "dot" },

  { id: "intake", x: 56, y: 410, w: 136, h: NH, label: "Intake", mark: "play" },
  { id: "qualify", x: 300, y: 410, w: 136, h: NH, label: "Qualify", mark: "box" },
  { id: "book", x: 560, y: 410, w: 128, h: NH, label: "Book", mark: "box" },
  { id: "cal", x: 820, y: 410, w: 140, h: NH, label: "Calendar", mark: "dot" },
  { id: "alert", x: 1100, y: 410, w: 128, h: NH, label: "Alert", mark: "dot" },

  { id: "research", x: 280, y: 590, w: 140, h: NH, label: "Research", mark: "box" },
  { id: "draft", x: 540, y: 590, w: 128, h: NH, label: "Draft", mark: "box" },
  { id: "drive", x: 820, y: 590, w: 128, h: NH, label: "Drive", mark: "dot" },
  { id: "publish", x: 1100, y: 590, w: 136, h: NH, label: "Publish", mark: "dot" },

  { id: "wait", x: 540, y: 760, w: 128, h: NH, label: "Wait", mark: "box" },
  { id: "hook", x: 820, y: 760, w: 128, h: NH, label: "Hook", mark: "play" },
];

const EDGES: FieldEdge[] = [
  { from: "webhook", to: "n8n", flow: "a" },
  { from: "n8n", to: "voice", flow: "a" },
  { from: "voice", to: "ghl" },
  { from: "ghl", to: "slack", flow: "b" },
  { from: "slack", to: "done" },
  { from: "n8n", to: "agent" },
  { from: "voice", to: "agent" },
  { from: "ghl", to: "crm", flow: "b" },
  { from: "crm", to: "sheet" },
  { from: "agent", to: "qualify" },
  { from: "intake", to: "qualify" },
  { from: "qualify", to: "book", flow: "c" },
  { from: "book", to: "cal", flow: "c" },
  { from: "cal", to: "alert" },
  { from: "intake", to: "research" },
  { from: "research", to: "draft", flow: "a" },
  { from: "draft", to: "drive" },
  { from: "drive", to: "publish" },
  { from: "agent", to: "book" },
  { from: "crm", to: "cal" },
  { from: "sheet", to: "alert" },
  { from: "draft", to: "wait" },
  { from: "drive", to: "hook" },
  { from: "wait", to: "hook" },
];

const NODE_MAP = Object.fromEntries(NODES.map((node) => [node.id, node]));

function pipePath(from: FieldNode, to: FieldNode) {
  const a = { x: from.x + from.w, y: from.y + from.h / 2 };
  const b = { x: to.x, y: to.y + to.h / 2 };
  const dx = Math.max(54, Math.abs(b.x - a.x) * 0.44);
  return `M${a.x} ${a.y} C${a.x + dx} ${a.y} ${b.x - dx} ${b.y} ${b.x} ${b.y}`;
}

function nodeOutline(w: number, h: number, cut = 7) {
  return `M${cut} 0 H${w - cut} L${w} ${cut} V${h - cut} L${w - cut} ${h} H${cut} L0 ${h - cut} V${cut} Z`;
}

const PIPES = EDGES.map((edge) => {
  const from = NODE_MAP[edge.from];
  const to = NODE_MAP[edge.to];
  return {
    key: `${edge.from}-${edge.to}`,
    d: pipePath(from, to),
    flow: edge.flow,
  };
});

function NodeMark({ mark }: { mark: Mark }) {
  if (mark === "play") {
    return <path className="automation-mark" d="M11 15.5 11 26.5 21.5 21 Z" />;
  }
  if (mark === "box") {
    return <rect className="automation-mark" x="10.5" y="15" width="11" height="11" rx="2" />;
  }
  return <circle className="automation-mark" cx="16" cy="21" r="3.1" />;
}

export default function AutomationField() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let visible = false;
    const sync = () => {
      root.classList.toggle("is-paused", !visible || document.hidden);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { rootMargin: "16% 0px", threshold: 0.08 },
    );
    io.observe(root);
    document.addEventListener("visibilitychange", sync);

    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return (
    <div ref={rootRef} className="automation-field is-paused" aria-hidden>
      <div className="automation-field-wash" />
      <div className="automation-field-grid" />
      <svg
        className="automation-field-svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        {PIPES.map((pipe) => (
          <path
            key={pipe.key}
            className={
              pipe.flow
                ? `automation-pipe automation-pipe--flow automation-pipe--${pipe.flow}`
                : "automation-pipe"
            }
            d={pipe.d}
          />
        ))}
        {NODES.map((node) => (
          <g key={node.id} transform={`translate(${node.x} ${node.y})`}>
            <path className="automation-node" d={nodeOutline(node.w, node.h)} />
            <rect className="automation-node-rail" x="3" y="8" width="3" height={node.h - 16} rx="1.5" />
            <rect className="automation-node-sheen" x="10" y="1.2" width={node.w - 20} height="1" />
            <NodeMark mark={node.mark} />
            <text
              className="automation-node-label"
              x="28"
              y={node.h / 2}
              dominantBaseline="central"
            >
              {node.label}
            </text>
            {node.live ? (
              <circle className="automation-pip" cx={node.w - 14} cy="12" r="2.6" />
            ) : null}
            <circle className="automation-port" cx="0" cy={node.h / 2} r="3.4" />
            <circle className="automation-port" cx={node.w} cy={node.h / 2} r="3.4" />
          </g>
        ))}
      </svg>
      <div className="automation-field-vignette" />
    </div>
  );
}
