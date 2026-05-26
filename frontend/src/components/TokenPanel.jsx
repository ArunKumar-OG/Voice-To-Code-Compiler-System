// frontend/src/components/TokenPanel.jsx

const TOKEN_COLORS = {
  VAR_DECL:     { bg: "#EEF2FF", text: "#4338CA", border: "#C7D2FE" },
  FUNC_DEF:     { bg: "#FDF4FF", text: "#7C3AED", border: "#E9D5FF" },
  IDENTIFIER:   { bg: "#F0FDF4", text: "#166534", border: "#BBF7D0" },
  INT_LITERAL:  { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  FLOAT_LITERAL:{ bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  ASSIGN:       { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
  PLUS:         { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  MINUS:        { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  MULTIPLY:     { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  DIVIDE:       { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  IF:           { bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
  ELSE:         { bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
  FOR:          { bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
  WHILE:        { bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
  PRINT:        { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD" },
  RETURN:       { bg: "#FDF2F8", text: "#9D174D", border: "#FBCFE8" },
  GREATER:      { bg: "#FEF9C3", text: "#713F12", border: "#FEF08A" },
  LESS:         { bg: "#FEF9C3", text: "#713F12", border: "#FEF08A" },
  AND:          { bg: "#F5F3FF", text: "#4C1D95", border: "#DDD6FE" },
  OR:           { bg: "#F5F3FF", text: "#4C1D95", border: "#DDD6FE" },
  NOT:          { bg: "#F5F3FF", text: "#4C1D95", border: "#DDD6FE" },
  EOF:          { bg: "#F9FAFB", text: "#9CA3AF", border: "#E5E7EB" },
  UNKNOWN:      { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA" },
};

function TokenBadge({ type }) {
  const color = TOKEN_COLORS[type] || TOKEN_COLORS["UNKNOWN"];
  return (
    <span
      style={{
        backgroundColor: color.bg,
        color: color.text,
        border: `1px solid ${color.border}`,
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600",
        fontFamily: "monospace",
        whiteSpace: "nowrap",
      }}
    >
      {type}
    </span>
  );
}

export default function TokenPanel({ data }) {
  if (!data) {
    return (
      <div style={styles.container}>
        <h2 style={styles.heading}>Phase 1 — Lexical Analysis</h2>
        <p style={styles.empty}>
          Speak or type a statement to see tokens appear here.
        </p>
        <div style={styles.examplesBox}>
          <p style={styles.examplesTitle}>Try saying:</p>
          <ul style={styles.exampleList}>
            <li>"define variable x equals five"</li>
            <li>"print x plus three"</li>
            <li>"if x greater than ten"</li>
            <li>"define function add a b"</li>
          </ul>
        </div>
      </div>
    );
  }

  const { input, tokens, token_count } = data;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Phase 1 — Lexical Analysis</h2>

      {/* Input display */}
      <div style={styles.inputBox}>
        <span style={styles.inputLabel}>Input</span>
        <span style={styles.inputText}>"{input}"</span>
        <span style={styles.badge}>{token_count} tokens</span>
      </div>

      {/* Token stream (visual row) */}
      <div style={styles.streamRow}>
        {tokens.map((tok, i) => (
          <div key={i} style={styles.streamItem}>
            <TokenBadge type={tok.type} />
            {tok.value && (
              <span style={styles.streamValue}>"{tok.value}"</span>
            )}
          </div>
        ))}
      </div>

      {/* Detailed token table */}
      <table style={styles.table}>
        <thead>
          <tr>
            {["#", "Token type", "Value", "Position", "Description"].map((h) => (
              <th key={h} style={styles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tokens.map((tok, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fafafa" : "#fff" }}>
              <td style={styles.td}>{i + 1}</td>
              <td style={styles.td}>
                <TokenBadge type={tok.type} />
              </td>
              <td style={{ ...styles.td, fontFamily: "monospace", color: "#333" }}>
                {tok.value || "—"}
              </td>
              <td style={{ ...styles.td, color: "#888" }}>{tok.position}</td>
              <td style={{ ...styles.td, color: "#555", fontSize: "13px" }}>
                {tok.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
    borderBottom: "2px solid #4A90D9",
    paddingBottom: "8px",
  },
  empty: { color: "#888", fontStyle: "italic" },
  examplesBox: {
    background: "#f8faff",
    border: "1px solid #dde4f5",
    borderRadius: "8px",
    padding: "14px 18px",
    marginTop: "12px",
  },
  examplesTitle: { margin: "0 0 8px", fontWeight: "600", fontSize: "13px", color: "#555" },
  exampleList: { margin: 0, paddingLeft: "18px", color: "#4338CA", fontSize: "14px", lineHeight: "1.8" },
  inputBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "#f4f6ff",
    border: "1px solid #dde4f5",
    borderRadius: "8px",
    padding: "10px 16px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  inputLabel: { fontSize: "11px", fontWeight: "700", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" },
  inputText: { fontSize: "15px", color: "#1a1a2e", fontStyle: "italic", flex: 1 },
  badge: {
    background: "#4A90D9",
    color: "#fff",
    borderRadius: "20px",
    padding: "3px 12px",
    fontSize: "12px",
    fontWeight: "600",
  },
  streamRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "20px",
    padding: "14px",
    background: "#fafafa",
    border: "1px dashed #ddd",
    borderRadius: "8px",
  },
  streamItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  streamValue: { fontSize: "11px", color: "#888", fontFamily: "monospace" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
    border: "1px solid #eee",
    borderRadius: "8px",
    overflow: "hidden",
  },
  th: {
    background: "#f0f4ff",
    padding: "10px 14px",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "13px",
    color: "#444",
    borderBottom: "1px solid #dde4f5",
  },
  td: {
    padding: "10px 14px",
    borderBottom: "1px solid #f0f0f0",
    verticalAlign: "middle",
  },
};