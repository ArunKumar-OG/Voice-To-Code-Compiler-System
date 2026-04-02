import { useState } from "react";
import VoiceInput     from "./components/VoiceInput";
import TokenPanel     from "./components/TokenPanel";
import ParseTreePanel from "./components/ParseTreePanel";
import SemanticPanel  from "./components/SemanticPanel";

export default function App() {
  const [compileData, setCompileData] = useState(null);

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1 style={styles.title}>Voice-to-Code Compiler</h1>
        <p style={styles.subtitle}>
          Speak a line of code — watch it travel through each compiler phase
        </p>
        <div style={styles.phasePills}>
          {[
            { label: "Lexical",  done: true  },
            { label: "Syntax",   done: true  },
            { label: "Semantic", done: true  },
            { label: "IR Gen",   done: false },
            { label: "Optimize", done: false },
            { label: "Code Gen", done: false },
          ].map(({ label, done }) => (
            <span key={label} style={{ ...styles.pill, ...(done ? styles.pillActive : {}) }}>
              {done ? "✓ " : ""}{label}
            </span>
          ))}
        </div>
      </header>

      <main style={styles.main}>
        <VoiceInput
          endpoint="http://localhost:8000/compile/semantic"
          onTokensReceived={setCompileData}
        />
        <TokenPanel     data={compileData} />
        <ParseTreePanel data={compileData} />
        <SemanticPanel  data={compileData} />
      </main>
    </div>
  );
}

const styles = {
  app:        { minHeight: "100vh", background: "#f0f4ff", fontFamily: "'Segoe UI', sans-serif" },
  header:     { background: "#1a1a2e", color: "#fff", padding: "28px 40px" },
  title:      { margin: "0 0 6px", fontSize: "26px", fontWeight: "700" },
  subtitle:   { margin: "0 0 16px", color: "#aab8d4", fontSize: "15px" },
  phasePills: { display: "flex", gap: "8px", flexWrap: "wrap" },
  pill:       { padding: "5px 14px", borderRadius: "20px", fontSize: "13px", background: "#2a2a4a", color: "#8899cc", border: "1px solid #3a3a5a" },
  pillActive: { background: "#15803D", color: "#fff", border: "1px solid #15803D" },
  main:       { maxWidth: "900px", margin: "32px auto", padding: "0 24px" },
<<<<<<< HEAD
};
=======
};
>>>>>>> origin/voice_lex
