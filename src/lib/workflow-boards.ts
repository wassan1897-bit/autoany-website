export type WorkflowNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  lit: number;
  port?: boolean;
};

export type WorkflowBoard = {
  nodes: WorkflowNode[];
  edges: string[];
};

export type WorkflowVariant =
  | "hero"
  | "gate"
  | "work"
  | "systems"
  | "tools"
  | "reviews";

const START: WorkflowNode = {
  id: "start",
  label: "",
  x: 715,
  y: 3,
  w: 10,
  h: 10,
  lit: 0.03,
  port: true,
};

const END: WorkflowNode = {
  id: "end",
  label: "",
  x: 715,
  y: 887,
  w: 10,
  h: 10,
  lit: 0.97,
  port: true,
};

function board(nodes: WorkflowNode[], edges: string[]): WorkflowBoard {
  return { nodes: [START, ...nodes, END], edges };
}

export const WORKFLOW_BOARDS: Record<WorkflowVariant, WorkflowBoard> = {
  hero: board(
    [
      { id: "intake", label: "INTAKE", x: 656, y: 120, w: 128, h: 32, lit: 0.14 },
      { id: "voice", label: "VOICE", x: 972, y: 280, w: 108, h: 32, lit: 0.34 },
      { id: "api", label: "API", x: 220, y: 438, w: 84, h: 32, lit: 0.54 },
      { id: "crm", label: "CRM", x: 980, y: 590, w: 92, h: 32, lit: 0.74 },
      { id: "ops", label: "OPS", x: 664, y: 740, w: 112, h: 32, lit: 0.9 },
    ],
    [
      "M 720 8 C 720 8, 720 120, 720 120",
      "M 784 136 C 878 136, 878 296, 972 296",
      "M 1080 296 C 650 296, 650 454, 220 454",
      "M 304 454 C 642 454, 642 606, 980 606",
      "M 1072 606 C 896 606, 896 740, 720 740",
      "M 720 772 C 720 772, 720 892, 720 892",
    ],
  ),
  gate: board(
    [
      { id: "trigger", label: "TRIGGER", x: 648, y: 118, w: 144, h: 32, lit: 0.14 },
      { id: "switch", label: "SWITCH", x: 1008, y: 270, w: 116, h: 32, lit: 0.34 },
      { id: "route", label: "ROUTE", x: 200, y: 430, w: 108, h: 32, lit: 0.54 },
      { id: "run", label: "RUN", x: 1020, y: 580, w: 84, h: 32, lit: 0.74 },
      { id: "exec", label: "EXEC", x: 656, y: 738, w: 128, h: 32, lit: 0.9 },
    ],
    [
      "M 720 8 C 720 8, 720 118, 720 118",
      "M 792 134 C 900 134, 900 286, 1008 286",
      "M 1124 286 C 662 286, 662 446, 200 446",
      "M 308 446 C 664 446, 664 596, 1020 596",
      "M 1104 596 C 912 596, 912 738, 720 738",
      "M 720 770 C 720 770, 720 892, 720 892",
    ],
  ),
  work: board(
    [
      { id: "brief", label: "BRIEF", x: 658, y: 122, w: 124, h: 32, lit: 0.14 },
      { id: "build", label: "BUILD", x: 198, y: 288, w: 108, h: 32, lit: 0.34 },
      { id: "wire", label: "WIRE", x: 1004, y: 448, w: 96, h: 32, lit: 0.54 },
      { id: "qa", label: "QA", x: 216, y: 588, w: 80, h: 32, lit: 0.74 },
      { id: "ship", label: "SHIP", x: 666, y: 738, w: 108, h: 32, lit: 0.9 },
    ],
    [
      "M 720 8 C 720 8, 720 122, 720 122",
      "M 658 138 C 482 138, 482 304, 306 304",
      "M 306 304 C 655 304, 655 464, 1004 464",
      "M 1100 464 C 658 464, 658 604, 216 604",
      "M 296 604 C 508 604, 508 738, 720 738",
      "M 720 770 C 720 770, 720 892, 720 892",
    ],
  ),
  systems: board(
    [
      { id: "voice", label: "VOICE", x: 656, y: 120, w: 128, h: 32, lit: 0.14 },
      { id: "parse", label: "PARSE", x: 996, y: 278, w: 108, h: 32, lit: 0.34 },
      { id: "crm", label: "CRM", x: 208, y: 438, w: 88, h: 32, lit: 0.54 },
      { id: "ops", label: "OPS", x: 1008, y: 586, w: 84, h: 32, lit: 0.74 },
      { id: "desk", label: "DESK", x: 666, y: 738, w: 108, h: 32, lit: 0.9 },
    ],
    [
      "M 720 8 C 720 8, 720 120, 720 120",
      "M 784 136 C 890 136, 890 294, 996 294",
      "M 1104 294 C 656 294, 656 454, 208 454",
      "M 296 454 C 652 454, 652 602, 1008 602",
      "M 1092 602 C 906 602, 906 738, 720 738",
      "M 720 770 C 720 770, 720 892, 720 892",
    ],
  ),
  tools: board(
    [
      { id: "n8n", label: "N8N", x: 674, y: 120, w: 92, h: 32, lit: 0.14 },
      { id: "retell", label: "RETELL", x: 996, y: 278, w: 120, h: 32, lit: 0.34 },
      { id: "ghl", label: "GHL", x: 236, y: 438, w: 84, h: 32, lit: 0.54 },
      { id: "cal", label: "CAL", x: 1008, y: 586, w: 84, h: 32, lit: 0.74 },
      { id: "stack", label: "STACK", x: 658, y: 738, w: 124, h: 32, lit: 0.9 },
    ],
    [
      "M 720 8 C 720 8, 720 120, 720 120",
      "M 766 136 C 881 136, 881 294, 996 294",
      "M 1116 294 C 676 294, 676 454, 236 454",
      "M 320 454 C 664 454, 664 602, 1008 602",
      "M 1092 602 C 906 602, 906 738, 720 738",
      "M 720 770 C 720 770, 720 892, 720 892",
    ],
  ),
  reviews: board(
    [
      { id: "call", label: "CALL", x: 668, y: 120, w: 104, h: 32, lit: 0.14 },
      { id: "note", label: "NOTE", x: 1004, y: 286, w: 96, h: 32, lit: 0.34 },
      { id: "proof", label: "PROOF", x: 212, y: 448, w: 108, h: 32, lit: 0.54 },
      { id: "book", label: "BOOK", x: 996, y: 592, w: 96, h: 32, lit: 0.74 },
      { id: "close", label: "CLOSE", x: 658, y: 738, w: 124, h: 32, lit: 0.9 },
    ],
    [
      "M 720 8 C 720 8, 720 120, 720 120",
      "M 772 136 C 888 136, 888 302, 1004 302",
      "M 1100 302 C 656 302, 656 464, 212 464",
      "M 320 464 C 658 464, 658 608, 996 608",
      "M 1092 608 C 906 608, 906 738, 720 738",
      "M 720 770 C 720 770, 720 892, 720 892",
    ],
  ),
};

export function spinePath(board: WorkflowBoard) {
  return board.edges.join(" ");
}
