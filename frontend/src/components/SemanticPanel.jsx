// frontend/src/components/SemanticPanel.jsx

export default function SemanticPanel({ data }) {
  if (!data || !data.symbol_table) {
    return (
      <div style={styles.container}>
        <h2 style={styles.heading}>Phase 3 — Semantic Analysis</h2>
        <p style={styles.empty}>Symbol table will appear here after compilation.</p>
      </div>
    );
  }

  const { symbol_table, errors, error_count, warning_count } = data;
  const symbols = Object.entries(symbol_table);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Phase 3 — Semantic Analysis</h2>

      <div style={styles.statsRow}>
        <span style={styles.stat}>Symbols: {symbols.length}</span>
        <span style={{ ...styles.stat, color: error_count > 0 ? "#B91C1C" : "#166534" }}>
          Errors: {error_count}
        </span>
        <span style={styles.stat}>Warnings: {warning_count}</span>
      </div>

      {errors && errors.length > 0 && (
        <div style={styles.errorBox}>
          {errors.map((e, i) => <div key={i}>⚠ {e}</div>)}
        </div>
      )}

      {symbols.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Symbol</th>
              <th style={styles.th}>Kind</th>
            </tr>
          </thead>
          <tbody>
            {symbols.map(([name, kind], i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "#fafafa" : "#fff" }}>
                <td style={{ ...styles.td, fontFamily: "monospace", color: "#166534" }}>{name}</td>
                <td style={styles.td}>{kind}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={styles.empty}>No symbols declared.</p>
      )}
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
    borderBottom: "2px solid #15803D",
    paddingBottom: "8px",
  },
  empty: { color: "#888", fontStyle: "italic" },
  statsRow: { display: "flex", gap: "16px", marginBottom: "14px" },
  stat: { fontSize: "13px", fontWeight: "600", color: "#555" },
  errorBox: {
    background: "#FEF2F2",
    border: "1px solid #FECACA",
    color: "#B91C1C",
    borderRadius: "8px",
    padding: "10px 14px",
    marginBottom: "12px",
    fontSize: "14px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
    border: "1px solid #eee",
    borderRadius: "8px",
    overflow: "hidden",
  },
  th: {
    background: "#f0fdf4",
    padding: "10px 14px",
    textAlign: "left",
    fontWeight: "600",
    fontSize: "13px",
    color: "#444",
    borderBottom: "1px solid #dde4f5",
  },
  td: { padding: "10px 14px", borderBottom: "1px solid #f0f0f0" },
};
