<<<<<<< HEAD
// frontend/src/components/ParseTreePanel.jsx

function TreeNode({ node, depth = 0 }) {
  if (!node) return null;
  const indent = depth * 20;
  const children = node.children || [];

  return (
    <div style={{ marginLeft: indent }}>
      <div style={styles.node}>
        <span style={styles.nodeType}>{node.type}</span>
        {node.name  && <span style={styles.nodeProp}> name="{node.name}"</span>}
        {node.value && <span style={styles.nodeProp}> value="{node.value}"</span>}
        {node.op    && <span style={styles.nodeProp}> op="{node.op}"</span>}
      </div>
      {children.map((child, i) => (
        <TreeNode key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function ParseTreePanel({ data }) {
  if (!data || !data.ast) {
    return (
      <div style={styles.container}>
        <h2 style={styles.heading}>Phase 2 — Syntax Analysis (AST)</h2>
        <p style={styles.empty}>AST will appear here after compilation.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Phase 2 — Syntax Analysis (AST)</h2>
      {data.parse_error && (
        <div style={styles.error}>Parse error: {data.parse_error}</div>
      )}
      <div style={styles.tree}>
        <TreeNode node={data.ast} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    background: "#fff",
    border: "1px solid #e0e0e0",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
  },
  heading: {
    margin: "0 0 16px",
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a2e",
    borderBottom: "2px solid #7C3AED",
    paddingBottom: "8px",
  },
  empty: { color: "#888", fontStyle: "italic" },
  error: {
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    color: "#B91C1C",
    borderRadius: "8px",
    padding: "10px 14px",
    marginBottom: "12px",
    fontSize: "14px",
  },
  tree: {
    background: "#fafafa",
    border: "1px dashed #ddd",
    borderRadius: "8px",
    padding: "16px",
    fontFamily: "monospace",
    fontSize: "13px",
    overflowX: "auto",
  },
  node: { padding: "3px 0" },
  nodeType: { color: "#7C3AED", fontWeight: "700" },
  nodeProp: { color: "#555" },
};
=======

import { useState } from "react";

// Color per node type
const NODE_COLORS = {
  Program:    { bg: "#EDE9FE", border: "#7C3AED", text: "#4C1D95" },
  VarDecl:    { bg: "#E0F2FE", border: "#0284C7", text: "#0C4A6E" },
  FuncDef:    { bg: "#F3E8FF", border: "#9333EA", text: "#581C87" },
  PrintStmt:  { bg: "#DCFCE7", border: "#16A34A", text: "#14532D" },
  IfStmt:     { bg: "#FEF9C3", border: "#CA8A04", text: "#713F12" },
  ForLoop:    { bg: "#FEF3C7", border: "#D97706", text: "#78350F" },
  WhileLoop:  { bg: "#FEF3C7", border: "#D97706", text: "#78350F" },
  ReturnStmt: { bg: "#FCE7F3", border: "#DB2777", text: "#831843" },
  BinaryOp:   { bg: "#ECFDF5", border: "#059669", text: "#064E3B" },
  CompareOp:  { bg: "#FFF7ED", border: "#EA580C", text: "#7C2D12" },
  Identifier: { bg: "#F8FAFC", border: "#64748B", text: "#1E293B" },
  IntLiteral: { bg: "#FFF7ED", border: "#C2410C", text: "#7C2D12" },
  FloatLiteral:{ bg: "#FFF7ED", border: "#C2410C", text: "#7C2D12" },
  Condition:  { bg: "#FEF9C3", border: "#A16207", text: "#713F12" },
  Param:      { bg: "#F0FDF4", border: "#15803D", text: "#14532D" },
  FuncName:   { bg: "#FAF5FF", border: "#7E22CE", text: "#581C87" },
  RangeStart: { bg: "#F0F9FF", border: "#0369A1", text: "#0C4A6E" },
  RangeEnd:   { bg: "#F0F9FF", border: "#0369A1", text: "#0C4A6E" },
  ExprStmt:   { bg: "#F8FAFC", border: "#94A3B8", text: "#334155" },
  Unknown:    { bg: "#FEF2F2", border: "#DC2626", text: "#7F1D1D" },
};

// Get a short label for each node type
function nodeLabel(node) {
  if (!node) return "?";
  switch (node.type) {
    case "Program":     return "Program";
    case "VarDecl":     return `VarDecl  x = ${node.name || "?"}`;
    case "FuncDef":     return `FuncDef  ${node.name || "?"}()`;
    case "Identifier":  return `ID: ${node.name || node.value || "?"}`;
    case "IntLiteral":  return `Int: ${node.value}`;
    case "FloatLiteral":return `Float: ${node.value}`;
    case "BinaryOp":    return `BinaryOp (${node.op || node.op_type || "op"})`;
    case "CompareOp":   return `Compare (${node.op})`;
    case "Param":       return `Param: ${node.name}`;
    case "FuncName":    return `Name: ${node.name}`;
    case "PrintStmt":   return "PrintStmt";
    case "IfStmt":      return "IfStmt";
    case "ForLoop":     return `ForLoop (${node.var || "i"})`;
    case "WhileLoop":   return "WhileLoop";
    case "ReturnStmt":  return "ReturnStmt";
    case "Condition":   return "Condition";
    case "RangeStart":  return "Start";
    case "RangeEnd":    return "End";
    case "ExprStmt":    return "ExprStmt";
    default:            return node.type || "Node";
  }
}

// Single tree node, recursive
function TreeNode({ node, depth = 0 }) {
  const [open, setOpen] = useState(true);
  if (!node) return null;

  const hasChildren = node.children && node.children.length > 0;
  const color = NODE_COLORS[node.type] || NODE_COLORS["Unknown"];
  const indent = depth * 28;

  return (
    <div style={{ marginLeft: `${indent}px`, marginBottom: "6px" }}>
      {/* Node box */}
      <div
        onClick={() => hasChildren && setOpen((o) => !o)}
        style={{
          display:        "inline-flex",
          alignItems:     "center",
          gap:            "8px",
          backgroundColor: color.bg,
          border:         `1.5px solid ${color.border}`,
          borderRadius:   "8px",
          padding:        "6px 14px",
          cursor:         hasChildren ? "pointer" : "default",
          userSelect:     "none",
          fontSize:       "13px",
          fontFamily:     "monospace",
          color:          color.text,
          fontWeight:     "500",
          transition:     "opacity 0.15s",
        }}
      >
        {/* Expand/collapse indicator */}
        {hasChildren && (
          <span style={{ fontSize: "11px", opacity: 0.7 }}>
            {open ? "▾" : "▸"}
          </span>
        )}
        {/* Node type badge */}
        <span
          style={{
            backgroundColor: color.border,
            color: "#fff",
            borderRadius: "4px",
            padding: "1px 7px",
            fontSize: "11px",
            fontWeight: "700",
          }}
        >
          {node.type}
        </span>
        {/* Node label */}
        <span style={{ fontSize: "13px" }}>
          {nodeLabel(node)}
        </span>
        {/* Child count */}
        {hasChildren && (
          <span style={{ opacity: 0.5, fontSize: "11px" }}>
            {node.children.length} child{node.children.length !== 1 ? "ren" : ""}
          </span>
        )}
      </div>

      {/* Vertical connector line + children */}
      {hasChildren && open && (
        <div
          style={{
            borderLeft:  `2px solid ${color.border}`,
            marginLeft:  "18px",
            paddingLeft: "10px",
            marginTop:   "4px",
            opacity:     0.7,
          }}
        >
          {node.children.map((child, i) => (
            <TreeNode key={i} node={child} depth={0} />
          ))}
        </div>
      )}
    </div>
  );
}

// Stats bar
function ASTStats({ ast }) {
  let nodeCount = 0;
  let depth = 0;

  const walk = (node, d) => {
    if (!node) return;
    nodeCount++;
    if (d > depth) depth = d;
    (node.children || []).forEach((c) => walk(c, d + 1));
  };
  walk(ast, 0);

  return (
    <div style={styles.statsRow}>
      {[
        ["Total nodes", nodeCount],
        ["Max depth", depth],
        ["Root type", ast?.type || "—"],
        ["Statements", ast?.body?.length ?? "—"],
      ].map(([label, val]) => (
        <div key={label} style={styles.statCard}>
          <div style={styles.statVal}>{val}</div>
          <div style={styles.statLabel}>{label}</div>
        </div>
      ))}
    </div>
  );
}

export default function ParseTreePanel({ data }) {
  if (!data || !data.ast) {
    return (
      <div style={styles.container}>
        <h2 style={styles.heading}>Phase 2 — Syntax Analysis (Parse Tree)</h2>
        <p style={styles.empty}>
          Run the lexer first — the AST will appear here after parsing.
        </p>
      </div>
    );
  }

  const { ast, parse_error, input } = data;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Phase 2 — Syntax Analysis (Parse Tree / AST)</h2>

      {/* Input */}
      <div style={styles.inputBox}>
        <span style={styles.inputLabel}>Input</span>
        <span style={styles.inputText}>"{input}"</span>
      </div>

      {/* Parse error banner */}
      {parse_error && (
        <div style={styles.errorBanner}>
          <span style={{ fontWeight: 700 }}>Parse error:</span> {parse_error}
        </div>
      )}

      {/* Stats */}
      <ASTStats ast={ast} />

      {/* Tree legend */}
      <div style={styles.legend}>
        <span style={styles.legendTitle}>Click any node to expand / collapse</span>
        {["Program","VarDecl","BinaryOp","Identifier","IntLiteral"].map((t) => {
          const c = NODE_COLORS[t];
          return (
            <span key={t} style={{ ...styles.legendBadge, backgroundColor: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
              {t}
            </span>
          );
        })}
      </div>

      {/* Tree */}
      <div style={styles.treeContainer}>
        <TreeNode node={ast} depth={0} />
      </div>

      {/* Raw JSON toggle */}
      <details style={styles.details}>
        <summary style={styles.summary}>View raw AST JSON</summary>
        <pre style={styles.pre}>{JSON.stringify(ast, null, 2)}</pre>
      </details>
    </div>
  );
}

const styles = {
  container: {
    background: "#ffffff",
    border: "1px solid #e0e0e0",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
  },
  heading: {
    margin: "0 0 16px",
    fontSize: "18px",
    fontWeight: "600",
    color: "#1a1a2e",
    borderBottom: "2px solid #7C3AED",
    paddingBottom: "8px",
  },
  empty: { color: "#888", fontStyle: "italic" },
  inputBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#f4f6ff",
    border: "1px solid #dde4f5",
    borderRadius: "8px",
    padding: "10px 16px",
    marginBottom: "16px",
  },
  inputLabel: {
    fontSize: "11px", fontWeight: "700", color: "#888",
    textTransform: "uppercase", letterSpacing: "0.5px",
  },
  inputText: { fontSize: "15px", color: "#1a1a2e", fontStyle: "italic" },
  errorBanner: {
    background: "#FEF2F2", border: "1px solid #FCA5A5",
    borderRadius: "8px", padding: "10px 16px",
    color: "#B91C1C", fontSize: "14px", marginBottom: "14px",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "10px",
    marginBottom: "16px",
  },
  statCard: {
    background: "#f8f8ff", border: "1px solid #e0e0f0",
    borderRadius: "8px", padding: "10px 14px", textAlign: "center",
  },
  statVal:   { fontSize: "22px", fontWeight: "700", color: "#4338CA" },
  statLabel: { fontSize: "12px", color: "#888", marginTop: "2px" },
  legend: {
    display: "flex", alignItems: "center", gap: "8px",
    flexWrap: "wrap", marginBottom: "16px",
  },
  legendTitle: { fontSize: "12px", color: "#888", fontStyle: "italic", marginRight: "4px" },
  legendBadge: {
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "11px", fontWeight: "600", fontFamily: "monospace",
  },
  treeContainer: {
    background: "#fafafa", border: "1px solid #eee",
    borderRadius: "10px", padding: "20px",
    overflowX: "auto", marginBottom: "16px",
  },
  details: { marginTop: "8px" },
  summary: {
    cursor: "pointer", fontSize: "13px", color: "#7C3AED",
    fontWeight: "600", marginBottom: "8px",
  },
  pre: {
    background: "#1e1e2e", color: "#cdd6f4",
    borderRadius: "8px", padding: "16px",
    fontSize: "12px", fontFamily: "monospace",
    overflowX: "auto", lineHeight: "1.6",
  },
};
>>>>>>> origin/voice_lex
