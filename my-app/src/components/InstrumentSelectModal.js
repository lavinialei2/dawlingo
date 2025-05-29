import React from "react";
import { Mic, Piano } from "lucide-react";

const InstrumentSelectModal = ({ onSelect, onClose }) => {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "#222",
        padding: "2rem",
        borderRadius: "8px",
        color: "white",
        minWidth: "300px",
      }}>
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Select Track Type</h2>

        <button
          onClick={() => onSelect("microphone")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            background: "#333",
            color: "white",
            padding: "0.75rem 1rem",
            marginBottom: "1rem",
            borderRadius: "6px",
            border: "none",
            width: "100%",
            cursor: "pointer",
          }}
        >
          <Mic size={24} style={{ color: "#d66" }} />
          <span style={{ fontSize: "1rem" }}>Microphone</span>
        </button>

        <button
          onClick={() => onSelect("piano")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            background: "#333",
            color: "white",
            padding: "0.75rem 1rem",
            marginBottom: "1rem",
            borderRadius: "6px",
            border: "none",
            width: "100%",
            cursor: "pointer",
          }}
        >
          <Piano size={24} style={{ color: "#6ad" }} />
          <span style={{ fontSize: "1rem" }}>Piano</span>
        </button>

        <div style={{ textAlign: "center" }}>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              color: "#aaa",
              border: "none",
              textDecoration: "underline",
              cursor: "pointer"
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstrumentSelectModal;
