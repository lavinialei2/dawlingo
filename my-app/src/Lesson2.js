import React, { useState, useEffect, useRef } from "react";
import TransportControls from "./components/TransportControls";
import Timeline from "./components/Timeline";
import * as Tone from "tone";
import "./App.css";
import CongratsModal from "./components/CongratsModal";
import congratsImage from "./assets/lvl2complete.png";
import { useNavigate } from "react-router-dom";
import "./Playground.css";

export default function Lesson2({ unlockFeature }) {
  const [lessonComplete, setLessonComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const navigate = useNavigate();
  const [showCongrats, setShowCongrats] = useState(false);
  const [showInstrumentModal, setShowInstrumentModal] = useState(false);
  const [pendingTrackId, setPendingTrackId] = useState(null);
  // Define per-instrument samplers
  const samplers = {
    piano: new Tone.Sampler({
      urls: {
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
      },
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      onload: () => console.log("Piano loaded!"),
    }).toDestination(),

    guitar: new Tone.MonoSynth({
      oscillator: { type: "triangle" },
      envelope: {
        attack: 0.005,
        decay: 0.2,
        sustain: 0.2,
        release: 0.8,
      },
    }).toDestination(),
  };

  useEffect(() => {
    const stored = parseInt(
      localStorage.getItem("highestLessonCompleted") || "0",
      10
    );
    if (stored >= 2) {
      setLessonComplete(true);
      unlockFeature("compressor");
      unlockFeature("eq");
      unlockFeature("reverb");
    }
  }, []);


  useEffect(() => {
    let id;

    const update = () => {
      setPlayheadPosition(Tone.Transport.seconds);
      id = requestAnimationFrame(update);
    };

    id = requestAnimationFrame(update); // always run the loop

    return () => cancelAnimationFrame(id);
  }, []);

  const handleLessonComplete = () => {
    unlockFeature("compressor");
    unlockFeature("eq");
    unlockFeature("reverb");

    setLessonComplete(true);
    localStorage.setItem("lesson2Complete", "true");

    const currentProgress = parseInt(
      localStorage.getItem("highestLessonCompleted") || "0"
    );
    if (currentProgress < 2) {
      localStorage.setItem("highestLessonCompleted", "2");
    }

    setShowCongrats(true);
  };

  const onScrubPlayhead = (pos) => {
    Tone.Transport.seconds = pos;
    setPlayheadPosition(pos);
  };

  const onMoveClip = (trackId, clipIndex, newStart) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId
          ? {
              ...t,
              clips: t.clips.map((clip, i) =>
                i === clipIndex
                  ? { ...clip, start: Math.max(0, newStart) }
                  : clip
              ),
            }
          : t
      )
    );
  };

  const onDeleteClip = (trackId, clipIndex) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId
          ? { ...t, clips: t.clips.filter((_, i) => i !== clipIndex) }
          : t
      )
    );
  };

  const onSetClipVolume = (trackId, clipIndex, volume) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId
          ? {
              ...t,
              clips: t.clips.map((clip, i) =>
                i === clipIndex ? { ...clip, volume } : clip
              ),
            }
          : t
      )
    );
  };

  const addTrack = () => {
    const id = Date.now();
    const newTrack = {
      id,
      clips: [],
      volume: 1,
      muted: false,
      instrument: "voice",
      gainNode: new Tone.Gain(1).toDestination(),
    };
    setTracks([...tracks, newTrack]);
    setSelectedTrackId(id);
    setShowInstrumentModal(true);

  };

  const updateTrackVolume = (id, volume) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        if (t.gainNode) t.gainNode.gain.value = t.muted ? 0 : volume;
        return { ...t, volume };
      })
    );
  };

  const toggleMuteTrack = (id) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const newMuted = !t.muted;
        if (t.gainNode) t.gainNode.gain.value = newMuted ? 0 : t.volume;
        return { ...t, muted: newMuted };
      })
    );
  };

  const deleteSelectedTrack = () => {
    if (!selectedTrackId) return;
    setTracks((prev) => prev.filter((t) => t.id !== selectedTrackId));
    setSelectedTrackId(null);
  };

  const updateTrackClip = (id, clip) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, clips: [...(t.clips || []), clip] } : t
      )
    );
  };

  const handleTrackSelect = (id) => {
    setSelectedTrackId(id);
  };

const startRecording = async () => {
    if (!selectedTrackId) return;

    await Tone.start(); // ensures audio context is resumed
    const mic = new Tone.UserMedia();
    await mic.open();

    const rec = new Tone.Recorder();
    mic.connect(rec);
    rec.start();

    // if not already playing, start the transport
    if (Tone.Transport.state !== "started") {
      Tone.Transport.start();
    }


    // also make sure your app state reflects that playback is running
    setIsPlaying(true);

    // create temporary live clip
    setTracks((prevTracks) =>
      prevTracks.map((t) =>
        t.id === selectedTrackId
          ? {
            ...t,
            clips: [
              ...t.clips,
              {
                url: null,
                start: Tone.Transport.seconds,
                duration: 0,
                volume: 1,
                isRecordingClip: true,
              },
            ],
          }
          : t
      )
    );

    setIsRecording({
      mic,
      rec,
      startTime: Tone.Transport.seconds,
    });
  };

  const recordingRef = useRef(isRecording);
  recordingRef.current = isRecording;
  
  useEffect(() => {
    let id;
  
    const updateDuration = () => {
      const currentRecording = recordingRef.current;
      if (!currentRecording || !selectedTrackId) return;
  
      setTracks((prevTracks) =>
        prevTracks.map((t) =>
          t.id === selectedTrackId
            ? {
                ...t,
                clips: t.clips.map((clip) =>
                  clip.isRecordingClip
                    ? { ...clip, duration: Tone.Transport.seconds - clip.start }
                    : clip
                ),
              }
            : t
        )
      );
  
      id = requestAnimationFrame(updateDuration);
    };
  
    id = requestAnimationFrame(updateDuration);
    return () => cancelAnimationFrame(id);
  }, []);
  

  const stopRecording = async () => {
    if (!isRecording || !selectedTrackId) return;
    const recording = await isRecording.rec.stop();
    const blob = new Blob([recording], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);

    const clip = {
      url,
      start: isRecording.startTime,
      duration: 0,
      volume: 1,
    };

    const player = new Tone.Player({
      url,
      autostart: false,
      onload: () => {
        clip.duration = player.buffer.duration;
        const track = tracks.find((t) => t.id === selectedTrackId);
        if (!track) return;
        player.connect(track.gainNode);
        player.sync().start(clip.start);

        setTracks((prevTracks) =>
          prevTracks.map((t) =>
            t.id === selectedTrackId
              ? {
                ...t,
                clips: [
                  ...t.clips.filter((c) => !c.isRecordingClip),
                  clip,
                ],
              }
              : t
          )
        );

        setIsRecording(false);
      },
    });

    isRecording.mic.disconnect();
  };
  function InstrumentPanel({ instrument, onNotePlay }) {
    const notes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"];
    return (
      <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
        {notes.map((note) => (
          <button
            key={note}
            onClick={() => onNotePlay(note)}
            style={{
              padding: "12px",
              backgroundColor: "#f0f0f0",
              border: "1px solid #aaa",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {note}
          </button>
        ))}
      </div>
    );
  }

  const handleNotePlay = async (trackId, note) => {
    await Tone.start();
    const track = tracks.find((t) => t.id === trackId);
    const instrument = track?.instrument;
    const sampler = samplers[instrument];
    const time = Tone.Transport.seconds;

    if (!sampler) return;

    // Only wait if it's a Sampler
    if (sampler instanceof Tone.Sampler) {
      await sampler.loaded;
    }

    sampler.triggerAttackRelease(note, "8n", Tone.now());

    // Record this note as a clip
    if (isRecording && selectedTrackId === trackId) {
      const clip = {
        url: null,
        note,
        start: time,
        duration: Tone.Time("8n").toSeconds(),
        volume: 1,
        isVirtual: true,
      };

      updateTrackClip(trackId, clip);
    }
  };


  return (
    <div className="App">
      <h1>Lesson 2: Intro to Audio Effects</h1>
      <TransportControls isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
      <button onClick={addTrack}>Add Track</button>
      <div>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!selectedTrackId}
        >
          {isRecording ? "Stop Recording" : "Record"}
        </button>
        <button
          onClick={deleteSelectedTrack}
          disabled={!selectedTrackId}
          style={{ marginLeft: "8px" }}
        >
          Delete Track
        </button>
        <button onClick={() => onScrubPlayhead(0)}>Reset Playhead</button>
        {showInstrumentModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "24px",
                borderRadius: "8px",
                minWidth: "300px",
              }}
            >
              <h3>Select an Instrument</h3>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {["voice", "piano", "guitar", "drums"].map((instr) => (
                  <li key={instr}>
                    <button
                      onClick={() => {
                        const gainNode = new Tone.Gain(1).toDestination();
                        const newTrack = {
                          id: pendingTrackId,
                          clips: [],
                          volume: 1,
                          muted: false,
                          instrument: instr,
                          gainNode,
                        };
                        setTracks((prev) => [...prev, newTrack]);
                        setShowInstrumentModal(false);
                        setPendingTrackId(null);
                      }}
                      style={{
                        margin: "6px 0",
                        padding: "8px 12px",
                        width: "100%",
                        textAlign: "left",
                        fontSize: "16px",
                      }}
                    >
                      🎵 {instr.charAt(0).toUpperCase() + instr.slice(1)}
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setShowInstrumentModal(false)}
                style={{ marginTop: "12px" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <br />
        <label>Playhead:</label>
        <input
          type="range"
          min={0}
          max={60}
          step={0.1}
          value={playheadPosition}
          onChange={(e) => onScrubPlayhead(parseFloat(e.target.value))}
          disabled={isPlaying}
        />
      </div>
      <Timeline
        tracks={tracks}
        numBeats={16}
        selectedTrackId={selectedTrackId}
        onSelectTrack={handleTrackSelect}
        playheadPosition={playheadPosition}
        onMoveClip={onMoveClip}
        onDeleteClip={onDeleteClip}
        onSetClipVolume={onSetClipVolume}
        onScrubPlayhead={onScrubPlayhead}
        onVolumeChange={updateTrackVolume}
        onToggleMute={toggleMuteTrack}
        isRecording={isRecording}
      />

      {tracks.map((track) =>
        track.instrument !== "voice" ? (
          <InstrumentPanel
            key={track.id}
            instrument={track.instrument}
            onNotePlay={(note) => handleNotePlay(track.id, note)}
            isRecording={isRecording}
          />
        ) : null
      )}

      <div style={{ position: "fixed", bottom: "20px" }}>
        <button onClick={handleLessonComplete} disabled={lessonComplete}>
          {lessonComplete ? "✅ Lesson Completed" : "Mark Lesson Complete"}
        </button>
      </div>
      {showCongrats && (
        <CongratsModal
          image={congratsImage}
          onClose={() => {
            setShowCongrats(false);
          }}
          onReturnHome={() => {
            setTimeout(() => {
              navigate("/home");
            }, 50);
          }}
        />
      )}
    </div>
  );
}
