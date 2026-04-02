<<<<<<< HEAD
// frontend/src/components/VoiceInput.jsx

import { useState, useRef } from "react";
import axios from "axios";

export default function VoiceInput({ onTokensReceived, endpoint = "http://localhost:8000/compile/lex" }) {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText]   = useState("");
  const [status, setStatus]           = useState("idle"); // idle | listening | processing | done | error
  const recognitionRef = useRef(null);

  const startListening = () => {
    // Check browser support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("error");
      alert("Your browser does not support Speech Recognition. Please use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false; // wait for final result
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("listening");
      setSpokenText("");
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setSpokenText(transcript);
      setStatus("processing");
      setIsListening(false);

      // Send to FastAPI backend
      try {
        const response = await axios.post(endpoint, { text: transcript });
        onTokensReceived(response.data);
        setStatus("done");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      setIsListening(false);
      setStatus("error");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setStatus("idle");
  };

  // Manual text input fallback (useful for testing without microphone)
  const handleManualInput = async (e) => {
    e.preventDefault();
    const text = spokenText.trim();
    if (!text) return;
    setStatus("processing");
    try {
      const response = await axios.post(endpoint, { text });
      onTokensReceived(response.data);
      setStatus("done");
    } catch (err) {
      setStatus("error");
    }
  };

  const statusColors = {
    idle:       "#888",
    listening:  "#e74c3c",
    processing: "#f39c12",
    done:       "#27ae60",
    error:      "#e74c3c",
  };

  const statusLabels = {
    idle:       "Click mic to speak",
    listening:  "Listening... speak now",
    processing: "Processing...",
    done:       "Tokens generated!",
    error:      "Error occurred",
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Voice Input</h2>

      {/* Status indicator */}
      <div style={styles.statusRow}>
        <span
          style={{
            ...styles.statusDot,
            backgroundColor: statusColors[status],
            animation: status === "listening" ? "pulse 1s infinite" : "none",
          }}
        />
        <span style={styles.statusText}>{statusLabels[status]}</span>
      </div>

      {/* Mic button */}
      <button
        onClick={isListening ? stopListening : startListening}
        style={{
          ...styles.micButton,
          backgroundColor: isListening ? "#e74c3c" : "#4A90D9",
        }}
      >
        {isListening ? "⏹ Stop" : "🎤 Speak"}
      </button>

      {/* Spoken text display */}
      {spokenText && (
        <div style={styles.transcriptBox}>
          <span style={styles.label}>You said:</span>
          <p style={styles.transcript}>"{spokenText}"</p>
        </div>
      )}

      {/* Manual text fallback */}
      <form onSubmit={handleManualInput} style={styles.manualForm}>
        <input
          type="text"
          placeholder="Or type here to test (e.g. define variable x equals five)"
          value={spokenText}
          onChange={(e) => setSpokenText(e.target.value)}
          style={styles.textInput}
        />
        <button type="submit" style={styles.submitBtn}>
          Compile
        </button>
      </form>

      <style>{`
        @keyframes pulse {
          0%   { transform: scale(1);   opacity: 1;   }
          50%  { transform: scale(1.4); opacity: 0.6; }
          100% { transform: scale(1);   opacity: 1;   }
        }
      `}</style>
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
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
  },
  statusDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    display: "inline-block",
  },
  statusText: {
    fontSize: "14px",
    color: "#555",
  },
  micButton: {
    padding: "12px 32px",
    fontSize: "16px",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
    marginBottom: "16px",
    display: "block",
  },
  transcriptBox: {
    background: "#f8f8ff",
    border: "1px solid #d0d0ff",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "16px",
  },
  label: {
    fontSize: "12px",
    color: "#888",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  transcript: {
    margin: "6px 0 0",
    fontSize: "15px",
    color: "#333",
    fontStyle: "italic",
  },
  manualForm: {
    display: "flex",
    gap: "8px",
    marginTop: "8px",
  },
  textInput: {
    flex: 1,
    padding: "10px 14px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
  },
  submitBtn: {
    padding: "10px 20px",
    background: "#4A90D9",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
=======
// frontend/src/components/VoiceInput.jsx

import { useState, useRef } from "react";
import axios from "axios";

export default function VoiceInput({ onTokensReceived, endpoint = "http://localhost:8000/compile/lex" }) {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText]   = useState("");
  const [status, setStatus]           = useState("idle"); // idle | listening | processing | done | error
  const recognitionRef = useRef(null);

  const startListening = () => {
    // Check browser support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus("error");
      alert("Your browser does not support Speech Recognition. Please use Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false; // wait for final result
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("listening");
      setSpokenText("");
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setSpokenText(transcript);
      setStatus("processing");
      setIsListening(false);

      // Send to FastAPI backend
      try {
        const response = await axios.post("http://localhost:8000/compile/lex", {
          text: transcript,
        });
        onTokensReceived(response.data);
        setStatus("done");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech error:", event.error);
      setIsListening(false);
      setStatus("error");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
    setStatus("idle");
  };

  // Manual text input fallback (useful for testing without microphone)
  const handleManualInput = async (e) => {
    e.preventDefault();
    const text = spokenText.trim();
    if (!text) return;
    setStatus("processing");
    try {
      const response = await axios.post("http://localhost:8000/compile/lex", {
        text,
      });
      onTokensReceived(response.data);
      setStatus("done");
    } catch (err) {
      setStatus("error");
    }
  };

  const statusColors = {
    idle:       "#888",
    listening:  "#e74c3c",
    processing: "#f39c12",
    done:       "#27ae60",
    error:      "#e74c3c",
  };

  const statusLabels = {
    idle:       "Click mic to speak",
    listening:  "Listening... speak now",
    processing: "Processing...",
    done:       "Tokens generated!",
    error:      "Error occurred",
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Voice Input</h2>

      {/* Status indicator */}
      <div style={styles.statusRow}>
        <span
          style={{
            ...styles.statusDot,
            backgroundColor: statusColors[status],
            animation: status === "listening" ? "pulse 1s infinite" : "none",
          }}
        />
        <span style={styles.statusText}>{statusLabels[status]}</span>
      </div>

      {/* Mic button */}
      <button
        onClick={isListening ? stopListening : startListening}
        style={{
          ...styles.micButton,
          backgroundColor: isListening ? "#e74c3c" : "#4A90D9",
        }}
      >
        {isListening ? "⏹ Stop" : "🎤 Speak"}
      </button>

      {/* Spoken text display */}
      {spokenText && (
        <div style={styles.transcriptBox}>
          <span style={styles.label}>You said:</span>
          <p style={styles.transcript}>"{spokenText}"</p>
        </div>
      )}

      {/* Manual text fallback */}
      <form onSubmit={handleManualInput} style={styles.manualForm}>
        <input
          type="text"
          placeholder="Or type here to test (e.g. define variable x equals five)"
          value={spokenText}
          onChange={(e) => setSpokenText(e.target.value)}
          style={styles.textInput}
        />
        <button type="submit" style={styles.submitBtn}>
          Compile
        </button>
      </form>

      <style>{`
        @keyframes pulse {
          0%   { transform: scale(1);   opacity: 1;   }
          50%  { transform: scale(1.4); opacity: 0.6; }
          100% { transform: scale(1);   opacity: 1;   }
        }
      `}</style>
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
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
  },
  statusDot: {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    display: "inline-block",
  },
  statusText: {
    fontSize: "14px",
    color: "#555",
  },
  micButton: {
    padding: "12px 32px",
    fontSize: "16px",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
    marginBottom: "16px",
    display: "block",
  },
  transcriptBox: {
    background: "#f8f8ff",
    border: "1px solid #d0d0ff",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "16px",
  },
  label: {
    fontSize: "12px",
    color: "#888",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  transcript: {
    margin: "6px 0 0",
    fontSize: "15px",
    color: "#333",
    fontStyle: "italic",
  },
  manualForm: {
    display: "flex",
    gap: "8px",
    marginTop: "8px",
  },
  textInput: {
    flex: 1,
    padding: "10px 14px",
    fontSize: "14px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    outline: "none",
  },
  submitBtn: {
    padding: "10px 20px",
    background: "#4A90D9",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
>>>>>>> origin/voice_lex
};