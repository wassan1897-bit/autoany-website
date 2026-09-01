import { useEffect, useRef } from "react";
import {
  WORKFLOW_BOARDS,
  spinePath,
  type WorkflowNode,
  type WorkflowVariant,
} from "../lib/workflow-boards";
import { bindWorkflowProgress } from "../lib/site-theme-scroll";
import { useLocation } from "react-router-dom";
import ScrollAtmosphere from "./ScrollAtmosphere";
import "./SiteCanvas.css";

function PlateNode({ node }: { node: WorkflowNode }) {
  const cx = node.x + node.w / 2;
  const cy = node.y + node.h / 2 + 1;
  return (
    <g
      className={`wf-n wf-n-${node.id}${node.port ? " wf-n-port" : ""}`}
      data-lit={String(node.lit)}
    >
      {!node.port && (
        <rect
          className="wf-live-glow"
          x={node.x - 6}
          y={node.y - 6}
          width={node.w + 12}
          height={node.h + 12}
          rx="8"
        />
      )}
      <rect
        className="wf-plate"
        x={node.x}
        y={node.y}
        width={node.w}
        height={node.h}
        rx={node.port ? 2 : 6}
      />
      {node.label ? (
        <text
          className="wf-label"
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {node.label}
        </text>
      ) : null}
    </g>
  );
}

function WorkflowGraph({ variant }: { variant: WorkflowVariant }) {
  const data = WORKFLOW_BOARDS[variant];
  const spine = spinePath(data);
  return (
    <svg
      className="wf-board"
      viewBox="0 0 1440 900"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <path className="wf-spine" d={spine} pathLength={1} />
      <path className="wf-packet wf-packet-glow" d={spine} pathLength={1} />
      <path className="wf-packet wf-packet-core" d={spine} pathLength={1} />
      {data.nodes.map((node) => (
        <PlateNode key={node.id} node={node} />
      ))}
    </svg>
  );
}

export function SiteGridOverlay({
  variant = "hero",
}: {
  variant?: WorkflowVariant;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return bindWorkflowProgress(root);
  }, [variant]);

  return (
    <div ref={rootRef} className={`site-canvas-local wf-${variant}`} aria-hidden>
      <div className="wf-stage">
        <span className="wf-rail wf-rail-top" />
        <span className="wf-rail wf-rail-bot" />
        <WorkflowGraph variant={variant} />
      </div>
    </div>
  );
}

export default function SiteCanvas() {
  const { pathname } = useLocation();
  const kind = pathname.startsWith("/systems/")
    ? "case"
    : pathname === "/"
      ? "home"
      : "miss";
  const variant = kind === "case" ? "stack" : kind === "miss" ? "team" : "gate";

  return (
    <>
      <div className="site-canvas" aria-hidden />
      <div className={`site-wires site-wires--${kind}`} aria-hidden>
        <ScrollAtmosphere
          key={kind}
          variant={variant}
          className={`atm-root--wires atm-root--${kind}`}
        />
      </div>
    </>
  );
}
