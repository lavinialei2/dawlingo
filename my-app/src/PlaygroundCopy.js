import React, { useState, useEffect, useRef } from 'react';
import TransportControls from "./components/TransportControls";
import Timeline from "./components/Timeline";
import "./App.css";
import * as Tone from "tone";
import { useNavigate } from 'react-router-dom';
import './Playground.css';
import PlaygroundIntroModal from './components/PlaygroundIntroModal';
import playgroundIntro from './assets/playgroundIntro.png'
import LiveWaveform from "./components/LiveWaveform";
import PianoPanel from './components/PianoPanel';
import InstrumentSelectModal from './components/InstrumentSelectModal';
import { samplers } from './components/samplers';



const Playground = ({ featureLocks }) => {

  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [showCompressor, setShowCompressor] = useState(false);
  const [showEQ, setShowEQ] = useState(false);
  const [showReverb, setShowReverb] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [showInstrumentModal, setShowInstrumentModal] = useState(false);
  const scheduledParts = useRef([]);

  useEffect(() => {
    if (!isPlaying || isRecording) return; // 🔒 Do NOT schedule playback while recording

    scheduledParts.current.forEach(part => part.dispose());
    scheduledParts.current = [];

    tracks.forEach((track) => {
      if (track.instrument !== "piano" || track.muted) return;

      track.clips.forEach((clip) => {
        if (!clip.notes || clip.notes.length === 0) return;

        const part = new Tone.Part((time, { note, duration }) => {
          samplers.piano.triggerAttackRelease(note, duration || "8n", time);
        }, clip.notes.map(({ note, start, duration }) => [clip.start + start, { note, duration }]));

        part.start(0);
        Tone.Transport.scheduleOnce(() => part.start(), 0);
        scheduledParts.current.push(part);
      });
    });

    return () => {
      scheduledParts.current.forEach(part => part.dispose());
      scheduledParts.current = [];
    };
  }, [isPlaying, isRecording, tracks]);




  useEffect(() => {
    if (localStorage.getItem("showPlaygroundIntro") === "true") {
      setShowIntro(true);
      localStorage.removeItem("showPlaygroundIntro");
    }
  }, []);

  const navigateToHome = () => {
    navigate('/home');
  };

  useEffect(() => {
    let id;

    const update = () => {
      setPlayheadPosition(Tone.Transport.seconds);
      id = requestAnimationFrame(update);
    };

    id = requestAnimationFrame(update); // always run the loop

    return () => cancelAnimationFrame(id);
  }, []);



  // Use space bar on keyboard to control play/pause
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault(); // prevent page scroll
        setIsPlaying((prev) => {
          const newPlay = !prev;
          if (newPlay) {
            Tone.Transport.start();
          } else {
            Tone.Transport.pause();
          }
          return newPlay;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const onScrubPlayhead = (positionInSeconds) => {
    Tone.Transport.seconds = positionInSeconds;
    setPlayheadPosition(positionInSeconds);
  };

  const onMoveClip = (trackId, clipIndex, newStart) => {
    setTracks((prevTracks) =>
      [...prevTracks.map((t) =>
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
      )]
    );
  };



  const onDeleteClip = (trackId, clipIndex) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId
          ? {
            ...t,
            clips: t.clips.filter((_, i) => i !== clipIndex),
          }
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
    setShowInstrumentModal(true);
  };

  const confirmAddTrack = (instrumentType) => {
    const id = Date.now();
    const newTrack = {
      id,
      clips: [],
      volume: 1,
      muted: false,
      instrument: instrumentType, // 'piano' or 'microphone'
      gainNode: new Tone.Gain(1).toDestination(),
    };
    setTracks([...tracks, newTrack]);
    setSelectedTrackId(id);
    setShowInstrumentModal(false);
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
        return { ...t, muted: !t.muted };
      })
    );
  };

  const deleteSelectedTrack = () => {
    if (!selectedTrackId) return;

    // Stop any synced Tone.Players in the selected track
    const trackToDelete = tracks.find((t) => t.id === selectedTrackId);
    if (trackToDelete) {
      trackToDelete.clips.forEach((clip) => {
        if (clip.player && typeof clip.player.dispose === "function") {
          try {
            clip.player.unsync();
            clip.player.stop();
            clip.player.dispose();
          } catch (e) {
            console.warn("Failed to dispose player", e);
          }
        }
      });
    }

    setTracks((prev) => prev.filter((t) => t.id !== selectedTrackId));
    setSelectedTrackId(null);
  };


  const updateTrackClip = (id, clipOrUpdater) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
            ...t,
            clips: typeof clipOrUpdater === "function"
              ? clipOrUpdater(t.clips || [])
              : [...(t.clips || []), clipOrUpdater],
          }
          : t
      )
    );
  };



  const handleTrackSelect = (id) => {
    setSelectedTrackId(id);
  };

  const startRecording = async () => {
    if (!selectedTrackId) return;

    const track = tracks.find((t) => t.id === selectedTrackId);
    if (!track) return;

    const startTime = Tone.Transport.seconds;

    if (track.instrument === "microphone") {
      await Tone.start();
      const mic = new Tone.UserMedia();
      await mic.open();

      const rec = new Tone.Recorder();
      mic.connect(rec);
      rec.start();

      if (Tone.Transport.state !== "started") {
        Tone.Transport.start();
      }

      setIsPlaying(true);

      const analyser = Tone.context.createAnalyser();
      analyser.fftSize = 2048;
      mic._mediaStream.connect(analyser);

      setTracks((prevTracks) =>
        prevTracks.map((t) =>
          t.id === selectedTrackId
            ? {
              ...t,
              clips: [
                ...t.clips,
                {
                  url: null,
                  start: startTime,
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
        startTime,
        analyser,
      });
    }

    else if (track.instrument === "piano") {
      if (Tone.Transport.state !== "started") {
        Tone.Transport.start();
      }

      setIsPlaying(true);

      setTracks((prevTracks) =>
        prevTracks.map((t) =>
          t.id === selectedTrackId
            ? {
              ...t,
              clips: [
                ...t.clips,
                {
                  start: startTime,
                  duration: 0,
                  volume: 1,
                  isRecordingClip: true,
                  isVirtual: true,
                  notes: [], // will be populated by PianoPanel
                },
              ],
            }
            : t
        )
      );

      setIsRecording({
        startTime,
      });
    }
  };


  const recordingRef = useRef(isRecording);
  recordingRef.current = isRecording;

  useEffect(() => {
    let id;

    if (!isRecording || !selectedTrackId) return;

    const updateDuration = () => {
      const now = Tone.Transport.seconds;

      setTracks((prevTracks) =>
        [...prevTracks.map((t) =>
          t.id === selectedTrackId
            ? {
              ...t,
              clips: t.clips.map((clip) =>
                clip.isRecordingClip
                  ? { ...clip, duration: now - clip.start }
                  : clip
              ),
            }
            : t
        )]
      );

      id = requestAnimationFrame(updateDuration);
    };

    id = requestAnimationFrame(updateDuration);

    return () => cancelAnimationFrame(id);
  }, [isRecording, selectedTrackId]);



  const stopRecording = async () => {
    if (!isRecording || !selectedTrackId) return;

    const track = tracks.find((t) => t.id === selectedTrackId);
    if (!track) return;

    const endTime = Tone.Transport.seconds;
    const startTime = isRecording.startTime;

    if (track.instrument === "microphone") {
      const recording = await isRecording.rec.stop();
      const blob = new Blob([recording], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);

      const player = new Tone.Player({
        url,
        autostart: false,
        onload: () => {
          const clip = {
            url,
            start: startTime,
            duration: player.buffer.duration,
            volume: 1,
            waveform: null,
            player,
          };

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
    }
    else if (track.instrument === "piano") {
      const recordingClip = track.clips.find(
        (clip) => clip.isRecordingClip && clip.isVirtual
      );

      if (!recordingClip) {
        console.warn("No in-progress piano clip found.");
        return;
      }

      const finalizedClip = {
        ...recordingClip,
        isRecordingClip: false,
        duration: endTime - recordingClip.start,
      };

      setTracks((prevTracks) =>
        prevTracks.map((t) =>
          t.id === selectedTrackId
            ? {
              ...t,
              clips: [
                ...t.clips.filter((clip) => clip !== recordingClip),
                finalizedClip,
              ],
            }
            : t
        )
      );

      setIsRecording(false);
    }

  };



  const renderEffectButton = (label, isLocked, onClick) => (
    <div style={{ marginBottom: "1rem" }}>
      <h3>{label}</h3>
      <button
        disabled={isLocked}
        onClick={onClick}
        style={{
          padding: "0.5rem 1rem",
          background: isLocked ? "#777" : "#3fa9f5",
          color: "white",
          border: "none",
          cursor: isLocked ? "not-allowed" : "pointer",
        }}
      >
        {isLocked ? "Locked 🔒" : `Launch ${label}`}
      </button>
    </div>
  );

  return (
    <>
      <div className="playground-header">
        <h2 className="pixel-font playground-header-title">DAW Playground</h2>
        <button className="home-button" onClick={navigateToHome}>Home</button>
      </div>
      <div className="playground-container">

        <div className="playground-controls">
          <TransportControls isPlaying={isPlaying} setIsPlaying={setIsPlaying} />

          <button onClick={addTrack}>Add Track</button>

          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!selectedTrackId}
          >
            {isRecording ? "Stop Recording" : "Record"}
          </button>

          <button
            onClick={deleteSelectedTrack}
            disabled={!selectedTrackId}
          >
            Delete Track
          </button>

          <button onClick={() => onScrubPlayhead(0)}>Reset Playhead</button>

          <label style={{ display: 'block', marginTop: '10px' }}>Playhead:</label>
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
        />

        <PianoPanel
          disabled={featureLocks.piano}
          isRecording={isRecording}
          selectedTrackId={selectedTrackId}
          updateTrackClip={updateTrackClip}
          onNotePlayed={({ note, time }) => {
            if (isRecording && selectedTrackId) {
              const now = Tone.Transport.seconds;
              setTracks((prev) =>
                prev.map((t) =>
                  t.id === selectedTrackId && t.instrument === "piano"
                    ? {
                      ...t,
                      clips: t.clips.map((clip) =>
                        clip.isRecordingClip
                          ? {
                            ...clip,
                            notes: [...(clip.notes || []), { note, time: now }],
                          }
                          : clip
                      ),
                    }
                    : t
                )
              );
            }
          }}

        />


        {isRecording && isRecording.analyser && (
          <div>
            <h4 style={{ color: "#ccc" }}>Live Waveform</h4>
            <LiveWaveform analyser={isRecording.analyser} />
          </div>
        )}

        <div style={{ marginTop: "2rem" }}>
          {renderEffectButton("Compressor", featureLocks.compressor, () => setShowCompressor(true))}
          {renderEffectButton("EQ", featureLocks.eq, () => setShowEQ(true))}
          {renderEffectButton("Reverb", featureLocks.reverb, () => setShowReverb(true))}

          {showCompressor && !featureLocks.compressor && (
            <div style={{ border: "1px solid white", padding: "1rem", background: "#111" }}>
              <p>This is a placeholder for a Tone.js compressor.</p>
              <button onClick={() => setShowCompressor(false)}>Close</button>
            </div>
          )}

          {showEQ && !featureLocks.eq && (
            <div style={{ border: "1px solid white", padding: "1rem", background: "#111" }}>
              <p>This is a placeholder for a Tone.js EQ.</p>
              <button onClick={() => setShowEQ(false)}>Close</button>
            </div>
          )}

          {showReverb && !featureLocks.reverb && (
            <div style={{ border: "1px solid white", padding: "1rem", background: "#111" }}>
              <p>This is a placeholder for a Tone.js Reverb.</p>
              <button onClick={() => setShowReverb(false)}>Close</button>
            </div>
          )}

        </div>
      </div>
      {showInstrumentModal && (
        <InstrumentSelectModal
          onSelect={confirmAddTrack}
          onClose={() => setShowInstrumentModal(false)}
        />
      )}

      {showIntro && (
        <PlaygroundIntroModal
          image={playgroundIntro}
          onClose={() => setShowIntro(false)}
          onReturnHome={() => {
            setTimeout(() => {
              navigate("/home");
            }, 50);
          }}
        />
      )}
    </>
  );
};

export default Playground;
