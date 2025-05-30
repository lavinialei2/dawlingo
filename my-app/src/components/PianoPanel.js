import * as Tone from "tone";
import { useEffect, useState, useRef, useCallback } from "react";
import { samplers } from "./samplers";

// Static key mapping (safe to define outside the component)
const keyMap = {
  q: "C3", w: "D3", e: "E3", r: "F3", t: "G3",
  y: "A3", u: "B3", i: "C4", o: "D4", p: "E4", "[": "F4", "]": "G4",
  z: "A4", x: "B4", c: "C5", v: "D5", b: "E5", n: "F5", m: "G5", ",": "A5", ".": "B5", "/": "C6",
  "2": "C#3", "3": "D#3", "5": "F#3", "6": "G#3", "7": "A#3",
  "9": "C#4", "0": "D#4", "=": "F#4",
  a: "G#4", s: "A#4", f: "C#5", g: "D#5", j: "F#5", k: "G#5", l: "A#5"
};

const noteToKey = {};
Object.entries(keyMap).forEach(([key, note]) => {
  noteToKey[note] = key.toUpperCase();
});


const PianoPanel = ({
  disabled,
  isRecording,
  selectedTrackId,
  updateTrackClip,
  onNotePlayed
}) => {
  const whiteNotes = [
    "C3", "D3", "E3", "F3", "G3", "A3", "B3",
    "C4", "D4", "E4", "F4", "G4", "A4", "B4",
    "C5", "D5", "E5", "F5", "G5", "A5", "B5", "C6"
  ];

  const blackNotes = [
    { note: "C#3", position: 1 }, { note: "D#3", position: 2 },
    { note: "F#3", position: 4 }, { note: "G#3", position: 5 }, { note: "A#3", position: 6 },
    { note: "C#4", position: 8 }, { note: "D#4", position: 9 },
    { note: "F#4", position: 11 }, { note: "G#4", position: 12 }, { note: "A#4", position: 13 },
    { note: "C#5", position: 15 }, { note: "D#5", position: 16 },
    { note: "F#5", position: 18 }, { note: "G#5", position: 19 }, { note: "A#5", position: 20 }
  ];

  const keyWidth = 60;
  const whiteKeyHeight = 160;
  const blackKeyHeight = 120;
  const blackKeyOffset = keyWidth / 2;

  const [pressedNotes, setPressedNotes] = useState(new Set());

  const handleNoteDown = useCallback(async (note) => {
    if (disabled || pressedNotes.has(note)) return;
  
    await Tone.start();
    const now = Tone.immediate();
    const transportNow = Tone.Transport.seconds;
  
    samplers.piano.triggerAttack(note, now);
    setPressedNotes(prev => new Set(prev).add(note));
  
    if (isRecording && selectedTrackId) {
      updateTrackClip(selectedTrackId, (clips) =>
        clips.map((clip) =>
          clip.isRecordingClip && clip.isVirtual
            ? {
                ...clip,
                notes: [
                  ...(clip.notes || []),
                  { note, start: transportNow, isHeld: true }, // <–– Save start only
                ],
              }
            : clip
        )
      );
    }
  }, [disabled, pressedNotes, isRecording, selectedTrackId, updateTrackClip]);
  

  const handleNoteUp = useCallback((note) => {
    if (!pressedNotes.has(note)) return;
  
    const now = Tone.immediate();
    const transportNow = Tone.Transport.seconds;
  
    samplers.piano.triggerRelease(note, now);
    setPressedNotes(prev => {
      const next = new Set(prev);
      next.delete(note);
      return next;
    });
  
    if (isRecording && selectedTrackId) {
      updateTrackClip(selectedTrackId, (clips) =>
        clips.map((clip) =>
          clip.isRecordingClip && clip.isVirtual
            ? {
                ...clip,
                notes: clip.notes.map((n) =>
                  n.note === note && n.isHeld
                    ? {
                        ...n,
                        duration: transportNow - n.start,
                        isHeld: false,
                      }
                    : n
                ),
              }
            : clip
        )
      );
    }
  }, [pressedNotes, isRecording, selectedTrackId, updateTrackClip]);
  


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (disabled) return;
      const note = keyMap[e.key.toLowerCase()];
      if (note && !pressedNotes.has(note)) {
        handleNoteDown(note);
      }
    };

    const handleKeyUp = (e) => {
      const note = keyMap[e.key.toLowerCase()];
      if (note) {
        handleNoteUp(note);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [disabled, handleNoteDown, handleNoteUp, pressedNotes]);

  const handleNoteMouseDown = (note) => {
    if (disabled) return;
    handleNoteDown(note);
  };

  const handleNoteMouseUp = (note) => {
    handleNoteUp(note);
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <h4 style={{ marginBottom: "0.5rem" }}>
        Piano {disabled ? "(Locked)" : ""}
      </h4>
      <div style={{ position: "relative", height: whiteKeyHeight, width: whiteNotes.length * keyWidth }}>
        {whiteNotes.map((note, i) => (
          <button
            key={note}
            onMouseDown={() => handleNoteMouseDown(note)}
            onMouseUp={() => handleNoteMouseUp(note)}
            onMouseLeave={() => handleNoteMouseUp(note)}
            disabled={disabled}
            style={{
              position: "absolute",
              left: i * keyWidth,
              width: keyWidth,
              height: whiteKeyHeight,
              backgroundColor: pressedNotes.has(note) ? "#aaf" : disabled ? "#ccc" : "#fff",
              color: "#000",
              border: "1px solid #aaa",
              borderRadius: "0 0 4px 4px",
              zIndex: 1,
              cursor: disabled ? "not-allowed" : "pointer",
              fontSize: 12,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              paddingBottom: 4,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.2 }}>
              <div style={{ fontSize: 12 }}>{note}</div>
              <div style={{ fontSize: 12 }}>{noteToKey[note] || ""}</div>
            </div>
          </button>
        ))}
        {blackNotes.map(({ note, position }) => (
          <button
            key={note}
            onMouseDown={() => handleNoteMouseDown(note)}
            onMouseUp={() => handleNoteMouseUp(note)}
            onMouseLeave={() => handleNoteMouseUp(note)}
            disabled={disabled}
            style={{
              position: "absolute",
              left: (position - 0.08) * keyWidth - blackKeyOffset / 2,
              width: blackKeyOffset,
              height: blackKeyHeight,
              backgroundColor: pressedNotes.has(note) ? "#66f" : disabled ? "#444" : "#000",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: "0 0 4px 4px",
              zIndex: 2,
              cursor: disabled ? "not-allowed" : "pointer",
              fontSize: 10,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              paddingBottom: 4,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.2 }}>
              <div style={{ fontSize: 12 }}>{note}</div>
              <div style={{ fontSize: 12 }}>{noteToKey[note] || ""}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PianoPanel;
