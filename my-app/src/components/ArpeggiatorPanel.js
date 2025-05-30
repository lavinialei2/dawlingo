import React, { useState, useEffect, useRef } from "react";
import * as Tone from "tone";

// --- Chord formulas ---
const CHORD_FORMULAS = {
    major: [0, 4, 7],
    minor: [0, 3, 7],
    diminished: [0, 3, 6],
    augmented: [0, 4, 8],
    sus2: [0, 2, 7],
    sus4: [0, 5, 7],
    "7": [0, 4, 7, 10],
    maj7: [0, 4, 7, 11],
    min7: [0, 3, 7, 10],
    "9": [0, 4, 7, 10, 14],
    maj9: [0, 4, 7, 11, 14],
    min9: [0, 3, 7, 10, 14],
    "11": [0, 4, 7, 10, 14, 17],
    "13": [0, 4, 7, 10, 14, 17, 21],
    dim7: [0, 3, 6, 9],
    "half-diminished": [0, 3, 6, 10],
    minMaj7: [0, 3, 7, 11],
    add9: [0, 4, 7, 14]
};

// --- MIDI and scale mappings ---
const NOTE_TO_MIDI = {
    C: 48, "C#": 49, D: 50, "D#": 51, E: 52,
    F: 53, "F#": 54, G: 55, "G#": 56, A: 57,
    "A#": 58, B: 59
};

const MAJOR_SCALE_SEMITONES = [0, 2, 4, 5, 7, 9, 11];
const DEGREE_TO_INDEX = {
    I: 0, ii: 1, II: 1, iii: 2, III: 2,
    IV: 3, V: 4, vi: 5, VI: 5, vii: 6, VII: 6,
    "♭VII": 6, "♭VI": 5, iii7: 2
};

const ALL_KEYS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

// --- Progressions by genre ---
const PROGRESSIONS_BY_GENRE = {
    Pop: {
        "I–V–vi–IV": [
            { degree: "I", quality: "major" },
            { degree: "V", quality: "major" },
            { degree: "vi", quality: "minor" },
            { degree: "IV", quality: "major" }
        ],
        "I–vi–IV–V": [
            { degree: "I", quality: "major" },
            { degree: "vi", quality: "minor" },
            { degree: "IV", quality: "major" },
            { degree: "V", quality: "major" }
        ],
        "vi–IV–I–V": [
            { degree: "vi", quality: "minor" },
            { degree: "IV", quality: "major" },
            { degree: "I", quality: "major" },
            { degree: "V", quality: "major" }
        ],
        "I–V–vi–iii–IV": [
            { degree: "I", quality: "major" },
            { degree: "V", quality: "major" },
            { degree: "vi", quality: "minor" },
            { degree: "iii", quality: "minor" },
            { degree: "IV", quality: "major" }
        ],
        "I–IV–V": [
            { degree: "I", quality: "major" },
            { degree: "IV", quality: "major" },
            { degree: "V", quality: "major" }
        ]
    },
    Jazz: {
        "ii–V–I": [
            { degree: "ii", quality: "minor" },
            { degree: "V", quality: "7" },
            { degree: "I", quality: "major" }
        ],
        "iii–VI–ii–V": [
            { degree: "iii", quality: "minor" },
            { degree: "VI", quality: "7" },
            { degree: "ii", quality: "minor" },
            { degree: "V", quality: "7" }
        ],
        "I–vi–ii–V": [
            { degree: "I", quality: "major" },
            { degree: "vi", quality: "minor" },
            { degree: "ii", quality: "minor" },
            { degree: "V", quality: "7" }
        ],
        "ii–V–I–VI": [
            { degree: "ii", quality: "minor" },
            { degree: "V", quality: "7" },
            { degree: "I", quality: "major" },
            { degree: "VI", quality: "7" }
        ],
        "Imaj7–IVmaj7": [
            { degree: "I", quality: "maj7" },
            { degree: "IV", quality: "maj7" }
        ]
    }
};

// --- Helpers ---
function normalizeNoteName(note) {
    return note.replace("♭", "b").replace("♯", "#")
        .replace("Db", "C#")
        .replace("Eb", "D#")
        .replace("Gb", "F#")
        .replace("Ab", "G#")
        .replace("Bb", "A#");
}

function getRootFromDegree(key, degree) {
    const baseMidi = NOTE_TO_MIDI[normalizeNoteName(key)];
    const index = DEGREE_TO_INDEX[degree] ?? DEGREE_TO_INDEX[degree.toUpperCase()];
    const semitoneOffset = MAJOR_SCALE_SEMITONES[index] || 0;
    const midi = baseMidi + semitoneOffset;
    const note = Tone.Frequency(midi, "midi").toNote().replace(/[0-9]/g, "");
    return normalizeNoteName(note);
}

function midiToNoteName(midi) {
    return Tone.Frequency(midi, "midi").toNote();
}

function buildChord(root, type) {
    const baseMidi = NOTE_TO_MIDI[normalizeNoteName(root)];
    const intervals = CHORD_FORMULAS[type];

    if (baseMidi === undefined || intervals === undefined) {
        console.warn(`Unknown chord: root=${root}, type=${type}`);
        return [];
    }

    return intervals.map(semitone => baseMidi + semitone);
}

function getChordSequenceForKey(prog, key) {
    return prog.map(({ degree, quality }) => {
        const root = getRootFromDegree(key, degree);
        return { root, type: quality };
    });
}

// --- Main component ---
export default function Arpeggiator({ disabled = false }) {
    const [selectedGenre, setSelectedGenre] = useState("Pop");
    const [selectedProgressionName, setSelectedProgressionName] = useState("I–V–vi–IV");
    const [selectedKey, setSelectedKey] = useState("C");
    const [tempo, setTempo] = useState(144);
    const synthRef = useRef(null);
    const loopRef = useRef(null);
    const [playMode, setPlayMode] = useState("arpeggio"); // or "chord"


    useEffect(() => {
        synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
        Tone.Transport.bpm.value = tempo;
        return () => stopArpeggiatorLoop();
    }, []);

    useEffect(() => {
        Tone.Transport.bpm.rampTo(tempo, 0.2);
    }, [tempo]);

    const startArpeggiatorLoop = async () => {
        await Tone.start();
        stopArpeggiatorLoop();

        const chords = getChordSequenceForKey(
            PROGRESSIONS_BY_GENRE[selectedGenre][selectedProgressionName],
            selectedKey
        );

        let chordIndex = 0;
        const playChordPattern = (time, chord) => {
            const { root, type } = chord;
            const baseChord = buildChord(root, type);

            if (playMode === "chord") {
                const durations = [
                    "4n.", "4n.", "4n", // measure 1
                    "4n.", "4n.", "4n"  // measure 2
                ];

                let currentTime = time;
                durations.forEach((dur) => {
                    baseChord.forEach((midi) => {
                        const note = midiToNoteName(midi);
                        synthRef.current.triggerAttackRelease(note, dur, currentTime);
                    });
                    currentTime += Tone.Time(dur).toSeconds();
                });
                return;
            }

            // Arpeggio mode
            const pattern = [
                baseChord[0],
                baseChord[1],
                baseChord[2],
                baseChord[3] || baseChord[0] + 12,
                baseChord[2],
                baseChord[1],
                baseChord[0],
                baseChord[1],
                baseChord[2],
                baseChord[3] || baseChord[0] + 12,
                baseChord[2],
                baseChord[1],
            ];

            pattern.forEach((midi, i) => {
                const note = midiToNoteName(midi);
                synthRef.current.triggerAttackRelease(note, "8n", time + i * Tone.Time("8n").toSeconds());
            });
        };



        loopRef.current = new Tone.Loop((time) => {
            playChordPattern(time, chords[chordIndex]);
            chordIndex = (chordIndex + 1) % chords.length;
        }, playMode === "chord" ? Tone.Time("8n").toSeconds() * 16 : Tone.Time("8n").toSeconds() * 12);

        loopRef.current.start("+0.1");
        Tone.Transport.start();
    };

    const stopArpeggiatorLoop = () => {
        if (loopRef.current) {
            loopRef.current.stop(0);
            loopRef.current.cancel();
            loopRef.current = null;
        }

        Tone.Transport.stop();
        Tone.Transport.cancel();

        if (synthRef.current) {
            synthRef.current.releaseAll();
            synthRef.current.dispose();
            synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
        }
    };

    return (
        <div style={{
            width: "90%",
            backgroundColor: "#2a2a2a",
            border: "2px solid #444",
            borderRadius: "12px",
            color: "#ffffff",
            fontFamily: "'Segoe UI', sans-serif",
            marginTop: "2rem"
        }}>
            {/* Header */}
            <div style={{
                backgroundColor: "#7e6fe1",
                color: "#000",
                padding: "1rem",
                fontSize: "18px",
                fontWeight: "bold",
                textAlign: "center",
                borderTopLeftRadius: "10px",
                borderTopRightRadius: "10px"
            }}>
                {disabled ? "Arpeggiator (Locked)" : "Arpeggiator"}
            </div>

            {/* Body */}
            <div style={{ padding: "1.5rem" }}>
                {/* Key Selection */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ fontWeight: "bold", marginRight: "10px" }}>Key:</label>
                    <select
                        disabled={disabled}
                        value={selectedKey}
                        onChange={(e) => setSelectedKey(e.target.value)}
                        style={{
                            padding: "8px 12px",
                            fontSize: "14px",
                            borderRadius: "6px",
                            border: "1px solid #888",
                            backgroundColor: "#1f1f1f",
                            color: "#fff"
                        }}
                    >
                        {ALL_KEYS.map((key) => (
                            <option key={key} value={normalizeNoteName(key)}>{key}</option>
                        ))}
                    </select>
                </div>

                {/* Tempo Input */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ fontWeight: "bold", marginRight: "10px" }}>Tempo (BPM):</label>
                    <input
                        disabled={disabled}
                        type="number"
                        min={60}
                        max={180}
                        value={tempo}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (val >= 60 && val <= 180) setTempo(val);
                        }}
                        style={{
                            width: "80px",
                            padding: "8px",
                            fontSize: "14px",
                            borderRadius: "6px",
                            border: "1px solid #888",
                            backgroundColor: "#1f1f1f",
                            color: "#fff"
                        }}
                    />
                </div>

                {/* Pop Progressions */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <h3 style={{ color: "#ffffff", marginBottom: "0.5rem", fontSize: "14px" }}>Pop Progressions</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                        {Object.entries(PROGRESSIONS_BY_GENRE["Pop"]).map(([name]) => (
                            <button
                                disabled={disabled}
                                key={name}
                                onClick={() => {
                                    setSelectedGenre("Pop");
                                    setSelectedProgressionName(name);
                                }}
                                style={{
                                    padding: "10px 14px",
                                    minWidth: "140px",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    borderRadius: "9999px",
                                    border: "none",
                                    backgroundColor:
                                        selectedGenre === "Pop" && selectedProgressionName === name
                                            ? "#7e6fe1"
                                            : "#444",
                                    color:
                                        selectedGenre === "Pop" && selectedProgressionName === name
                                            ? "#000"
                                            : "#fff",
                                    cursor: "pointer"
                                }}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Jazz Progressions */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <h3 style={{ color: "#ffffff", marginBottom: "0.5rem", fontSize: "14px" }}>Jazz Progressions</h3>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                        {Object.entries(PROGRESSIONS_BY_GENRE["Jazz"]).map(([name]) => (
                            <button
                                disabled={disabled}
                                key={name}
                                onClick={() => {
                                    setSelectedGenre("Jazz");
                                    setSelectedProgressionName(name);
                                }}
                                style={{
                                    padding: "10px 14px",
                                    minWidth: "140px",
                                    fontSize: "14px",
                                    fontWeight: 600,
                                    borderRadius: "9999px",
                                    border: "none",
                                    backgroundColor:
                                        selectedGenre === "Jazz" && selectedProgressionName === name
                                            ? "#9370db"
                                            : "#444",
                                    color:
                                        selectedGenre === "Jazz" && selectedProgressionName === name
                                            ? "#000"
                                            : "#fff",
                                    cursor: "pointer"
                                }}
                            >
                                {name}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: "flex", justifyContent: "center", gap: "1rem", margin: "1rem 0" }}>
                    <button
                        disabled={disabled}
                        onClick={() => setPlayMode("arpeggio")}
                        style={{
                            padding: "10px 16px",
                            backgroundColor: playMode === "arpeggio" ? "#6a5acd" : "#333",
                            color: "#fff",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        Arpeggio
                    </button>
                    <button
                        disabled={disabled}
                        onClick={() => setPlayMode("chord")}
                        style={{
                            padding: "10px 16px",
                            backgroundColor: playMode === "chord" ? "#6a5acd" : "#333",
                            color: "#fff",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                            fontWeight: "bold"
                        }}
                    >
                        Chord
                    </button>
                </div>


                {/* Play / Stop Buttons */}
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                    <button
                        disabled={disabled}
                        onClick={startArpeggiatorLoop}
                        style={{
                            padding: "10px 18px",
                            fontWeight: 600,
                            fontSize: "14px",
                            borderRadius: "9999px",
                            border: "none",
                            backgroundColor: "#7e6fe1",
                            color: "#000",
                            cursor: "pointer"
                        }}>
                        Play
                    </button>
                    <button
                        disabled={disabled}
                        onClick={stopArpeggiatorLoop}
                        style={{
                            padding: "10px 18px",
                            fontWeight: 600,
                            fontSize: "14px",
                            borderRadius: "9999px",
                            border: "none",
                            backgroundColor: "#777",
                            color: "#fff",
                            cursor: "pointer"
                        }}>
                        Stop
                    </button>
                </div>
            </div>
        </div>

    );
}
