import React, { useState, useEffect } from "react";
import TransportControls from "./components/TransportControls";
import Timeline from "./components/Timeline";
import "./App.css";
import { useNavigate } from "react-router-dom";
import "./Playground.css";
import PlaygroundIntroModal from "./components/PlaygroundIntroModal";
import playgroundIntro from "./assets/playgroundIntro.png";
import LiveWaveform from "./components/LiveWaveform";
import PianoPanel from "./components/PianoPanel";
import InstrumentSelectModal from "./components/InstrumentSelectModal";
import { DAWEngine } from "./components/DAWEngine";
import Arpeggiator from "./components/ArpeggiatorPanel";

const Playground = ({ featureLocks }) => {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(false);
  const [showInstrumentModal, setShowInstrumentModal] = useState(false);
  const [showCompressor, setShowCompressor] = useState(false);
  const [showEQ, setShowEQ] = useState(false);
  const [showReverb, setShowReverb] = useState(false);

  const {
    tracks,
    selectedTrackId,
    setSelectedTrackId,
    isRecording,
    isPlaying,
    togglePlay,
    startRecording,
    stopRecording,
    playheadPosition,
    onScrubPlayhead,
    updateTrackClip,
    addTrack,
    deleteTrack,
    updateTrackVolume,
    toggleMuteTrack,
    moveClip,
    deleteClip,
    setClipVolume,
  } = DAWEngine();

  useEffect(() => {
    if (!localStorage.getItem("hasSeenPlaygroundIntro")) {
      setShowIntro(true);
      localStorage.setItem("hasSeenPlaygroundIntro", "true");
    }
  }, []);

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
        <button className="home-button" onClick={() => navigate("/home")}>Home</button>
      </div>
      <div className="playground-container">
        <div className="playground-controls">
          <TransportControls isPlaying={isPlaying} setIsPlaying={togglePlay} />

          <button onClick={() => setShowInstrumentModal(true)}>Add Track</button>

          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!selectedTrackId}
          >
            {isRecording ? "Stop Recording" : "Record"}
          </button>

          <button onClick={() => deleteTrack(selectedTrackId)} disabled={!selectedTrackId}>
            Delete Track
          </button>

          <button onClick={() => onScrubPlayhead(0)}>Reset Playhead</button>

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
          onSelectTrack={setSelectedTrackId}
          playheadPosition={playheadPosition}
          onMoveClip={moveClip}
          onDeleteClip={deleteClip}
          onSetClipVolume={setClipVolume}
          onScrubPlayhead={onScrubPlayhead}
          onVolumeChange={updateTrackVolume}
          onToggleMute={toggleMuteTrack}
        />

        <PianoPanel
          disabled={featureLocks.piano}
          isRecording={isRecording}
          selectedTrackId={selectedTrackId}
          updateTrackClip={updateTrackClip}
        />
        <Arpeggiator/>

        {isRecording?.analyser && (
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
          onSelect={(instrumentType) => {
            addTrack(instrumentType);
            setShowInstrumentModal(false);
          }}
          onClose={() => setShowInstrumentModal(false)}
        />
      )}

      {showIntro && (
        <PlaygroundIntroModal
          image={playgroundIntro}
          onClose={() => setShowIntro(false)}
          onReturnHome={() => {
            setTimeout(() => navigate("/home"), 50);
          }}
        />
      )}
    </>
  );
};

export default Playground;
