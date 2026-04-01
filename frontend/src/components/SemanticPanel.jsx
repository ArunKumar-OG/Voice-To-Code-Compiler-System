// frontend/src/components/SemanticPanel.jsx

const DATA_TYPE_COLORS = {
  int:      { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  float:    { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
  function: { bg: "#F3E8FF", text: "#7C3AED", border: "#DDD6FE" },
  unknown:  { bg: "#F1F5F9", text: "#475569", border: "#CBD5E1" },
};

const SCOPE_COLORS = {
  global: { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  local:  { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
};

const SYM_TYPE_COLORS = {
  variable:  { bg: "#EEF2FF", text: "#4338CA", border: "#C7D2FE" },
  function:  { bg: "#FDF4FF", text: "#9333EA", border: "#E9D5FF" },
  parameter: { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" },
};

const ERROR_STYLES = {
  error:   { bg: "#FEF2F2", border: "#FCA5A5", text: "#B91C1C", dot: "#DC2626", label: "ERROR"   },
  warning: { bg: "#FFFBEB", border: "#FCD34D", text: "#92400E", dot: "#D97706", label: "WARN"    },
  info:    { bg: "#EFF6FF", border: "#93C5FD", text: "#1E40AF", dot: "#3B82F6", label: "INFO"    },
};

function Pill({ label, colors }) {
  return (
    <span style={{
      backgroundColor: colors.bg,
      color:           colors.text,
      border:          `1px solid ${colors.border}`,
      padding:         "2px 9px",
      borderRadius:    "20px",
      fontSize:        "11px",
      fontWeight:      "600",
      fontFamily:      "monospace",
      whiteSpace:      "nowrap",
    }}>
      {label}
    </span>
  );
}

function SymbolTable({ symbols }) {
  if (!symbols || symbols.length === 0) {
    return (
      <p style={{ color: "#888", fontStyle: "italic", fontSize: "14px" }}>
        No symbols declared yet.
      </p>
    );
  }

  return (
    <table style={tbl.table}>
      <thead>
        <tr>
          {["Name", "Symbol type", "Data type", "Scope", "Value", "Used"].map(h => (
            <th key={h} style={tbl.th}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {symbols.map((sym, i) => (
          <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fafafa" : "#fff" }}>
            <td style={{ ...tbl.td, fontFamily: "monospace", fontWeight: "600", color: "#1a1a2e" }}>
              {sym.name}
            </td>
            <td style={tbl.td}>
              <Pill label={sym.sym_type} colors={SYM_TYPE_COLORS[sym.sym_type] || SYM_TYPE_COLORS.variable} />
            </td>
            <td style={tbl.td}>
              <Pill label={sym.data_type} colors={DATA_TYPE_COLORS[sym.data_type] || DATA_TYPE_COLORS.unknown} />
            </td>
            <td style={tbl.td}>
              <Pill label={sym.scope} colors={SCOPE_COLORS[sym.scope] || SCOPE_COLORS.global} />
            </td>
            <td style={{ ...tbl.td, fontFamily: "monospace", color: "#555" }}>
              {sym.value ?? "—"}
            </td>
            <td style={tbl.td}>
              <span style={{
                color:      sym.used ? "#15803D" : "#DC2626",
                fontWeight: "600",
                fontSize:   "13px",
              }}>
                {sym.used ? "yes" : "no"}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ErrorList({ errors }) {
  if (!errors || errors.length === 0) {
    return (
      <div style={styles.allClearBox}>
        <span style={styles.allClearDot} />
        <span style={{ color: "#15803D", fontWeight: "600", fontSize: "14px" }}>
          No errors or warnings — semantics OK
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {errors.map((err, i) => {
        const s = ERROR_STYLES[err.level] || ERROR_STYLES.info;
        return (
          <div key={i} style={{
            backgroundColor: s.bg,
            border:          `1px solid ${s.border}`,
            borderRadius:    "8px",
            padding:         "10px 14px",
            display:         "flex",
            alignItems:      "flex-start",
            gap:             "10px",
          }}>
            <span style={{
              backgroundColor: s.dot,
              color:           "#fff",
              borderRadius:    "4px",
              padding:         "1px 7px",
              fontSize:        "11px",
              fontWeight:      "700",
              whiteSpace:      "nowrap",
              marginTop:       "1px",
            }}>
              {s.label}
            </span>
            <div>
              <div style={{ fontSize: "14px", color: s.text, fontWeight: "500" }}>
                {err.message}
              </div>
              {err.node_type && (
                <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>
                  in node: <code style={{ fontFamily: "monospace" }}>{err.node_type}</code>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SemanticPanel({ data }) {
  if (!data || !data.symbol_table) {
    return (
      <div style={styles.container}>
        <h2 style={styles.heading}>Phase 3 — Semantic Analysis</h2>
        <p style={styles.empty}>
          Compile a statement first — the symbol table and error list will appear here.
        </p>
      </div>
    );
  }

  const { symbol_table, errors, error_count, warning_count, input } = data;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Phase 3 — Semantic Analysis</h2>

      {/* Input */}
      <div style={styles.inputBox}>
        <span style={styles.inputLabel}>Input</span>
        <span style={styles.inputText}>"{input}"</span>
      </div>

      {/* Summary badges */}
      <div style={styles.summaryRow}>
        <div style={styles.summaryCard}>
          <div style={{ fontSize: "22px", fontWeight: "700", color: "#15803D" }}>
            {symbol_table.length}
          </div>
          <div style={styles.summaryLabel}>Symbols declared</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={{ fontSize: "22px", fontWeight: "700", color: error_count > 0 ? "#DC2626" : "#15803D" }}>
            {error_count}
          </div>
          <div style={styles.summaryLabel}>Errors</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={{ fontSize: "22px", fontWeight: "700", color: warning_count > 0 ? "#D97706" : "#15803D" }}>
            {warning_count}
          </div>
          <div style={styles.summaryLabel}>Warnings</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={{ fontSize: "22px", fontWeight: "700", color: error_count === 0 ? "#15803D" : "#DC2626" }}>
            {error_count === 0 ? "PASS" : "FAIL"}
          </div>
          <div style={styles.summaryLabel}>Semantic check</div>
        </div>
      </div>

      {/* Symbol Table */}
      <div style={styles.section}>
        <h3 style={styles.sectionHeading}>Symbol table</h3>
        <SymbolTable symbols={symbol_table} />
      </div>

      {/* Error / Warning List */}
      <div style={styles.section}>
        <h3 style={styles.sectionHeading}>Errors and warnings</h3>
        <ErrorList errors={errors} />
      </div>
    </div>
  );
}

const tbl = {
  table: {
    width: "100%", borderCollapse: "collapse",
    fontSize: "13px", border: "1px solid #eee",
    borderRadius: "8px", overflow: "hidden",
  },
  th: {
    background: "#f0f4ff", padding: "9px 12px",
    textAlign: "left", fontWeight: "600",
    fontSize: "12px", color: "#444",
    borderBottom: "1px solid #dde4f5",
  },
  td: {
    padding: "9px 12px",
    borderBottom: "1px solid #f0f0f0",
    verticalAlign: "middle",
  },
};

const styles = {
  container: {
    background: "#ffffff", border: "1px solid #e0e0e0",
    borderRadius: "12px", padding: "24px", marginBottom: "24px",
  },
  heading: {
    margin: "0 0 16px", fontSize: "18px", fontWeight: "600",
    color: "#1a1a2e", borderBottom: "2px solid #15803D",
    paddingBottom: "8px",
  },
  empty: { color: "#888", fontStyle: "italic" },
  inputBox: {
    display: "flex", alignItems: "center", gap: "10px",
    background: "#f4f6ff", border: "1px solid #dde4f5",
    borderRadius: "8px", padding: "10px 16px", marginBottom: "16px",
  },
  inputLabel: {
    fontSize: "11px", fontWeight: "700", color: "#888",
    textTransform: "uppercase", letterSpacing: "0.5px",
  },
  inputText: { fontSize: "15px", color: "#1a1a2e", fontStyle: "italic" },
  summaryRow: {
    display: "grid", gridTemplateColumns: "repeat(4,1fr)",
    gap: "10px", marginBottom: "20px",
  },
  summaryCard: {
    background: "#f8f8ff", border: "1px solid #e0e0f0",
    borderRadius: "8px", padding: "12px 14px", textAlign: "center",
  },
  summaryLabel: { fontSize: "12px", color: "#888", marginTop: "2px" },
  section: { marginBottom: "20px" },
  sectionHeading: {
    fontSize: "15px", fontWeight: "600", color: "#1a1a2e",
    margin: "0 0 10px", paddingLeft: "10px",
    borderLeft: "3px solid #15803D", borderRadius: 0,
  },
  allClearBox: {
    display: "flex", alignItems: "center", gap: "10px",
    background: "#F0FDF4", border: "1px solid #86EFAC",
    borderRadius: "8px", padding: "12px 16px",
  },
  allClearDot: {
    width: "10px", height: "10px", borderRadius: "50%",
    backgroundColor: "#16A34A", display: "inline-block", flexShrink: 0,
  },
};