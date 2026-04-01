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
