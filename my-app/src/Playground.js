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
import { getUnlockedFeatures } from "./featureUnlocks";

const Playground = () => {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(false);
  const [showInstrumentModal, setShowInstrumentModal] = useState(false);
  const [showCompressor, setShowCompressor] = useState(false);
  const [showEQ, setShowEQ] = useState(false);
  const [showReverb, setShowReverb] = useState(false);
  const [featureLocks, setFeatureLocks] = useState({ piano: true, compressor: true, eq: true, reverb: true, arp: true });

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
    const unlockedLevel = parseInt(localStorage.getItem("highestLessonCompleted") || "0");
    setFeatureLocks(getUnlockedFeatures(unlockedLevel));
  }, []);

  const renderEffectsRack = (isLocked = true) => {
    const renderDial = (label) => (
      <div style={{ margin: "1rem", textAlign: "center", width: "120px" }}>
        <div
          style={{
            width: "100px",
            height: "100px",
            margin: "0 auto",
            borderRadius: "50%",
            background: "radial-gradient(#444, #1e1e1e)",
            border: "4px solid #111",
            boxShadow: `
              inset -6px -6px 14px rgba(0,0,0,0.6),
              inset 4px 4px 12px rgba(255,255,255,0.03),
              0 2px 8px rgba(0, 0, 0, 0.8)
            `,
            position: "relative",
            opacity: isLocked ? 0.5 : 1
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "14px",
              left: "50%",
              width: "6px",
              height: "30px",
              backgroundColor: "#ccc",
              borderRadius: "3px",
              transform: "translateX(-50%) rotate(-20deg)",
              transformOrigin: "bottom center"
            }}
          />
        </div>
        <div style={{ marginTop: "0.75rem", fontSize: "16px", color: "#eee", fontWeight: "600" }}>
          {label}
        </div>
      </div>
    );

    const renderSlider = () => (
      <div style={{
        width: "20px",
        height: "140px",
        background: "linear-gradient(#333, #111)",
        borderRadius: "12px",
        position: "relative",
        boxShadow: "inset 0 0 8px #000, 0 2px 6px rgba(0,0,0,0.7)"
      }}>
        <div style={{
          position: "absolute",
          bottom: `${50}px`,
          left: "50%",
          transform: "translateX(-50%)",
          width: "24px",
          height: "14px",
          background: "#7e6fe1",
          borderRadius: "6px",
          boxShadow: "0 0 6px #7e6fe1"
        }} />
      </div>
    );

    return (
      <div style={{
        backgroundColor: "#2a2a2a",
        border: "3px solid #444",
        borderRadius: "24px",
        padding: "2rem",
        marginTop: "2rem",
        width: "100%",
        maxWidth: "960px",
        marginLeft: "auto",
        marginRight: "auto",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.75)"
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "2rem",
          position: "relative"
        }}>
          <h2 style={{
            color: "#7e6fe1",
            fontSize: "22px",
            fontWeight: "bold",
            letterSpacing: "1px",
            textShadow: "0 0 6px rgba(126,111,225,0.5)",
            margin: 0
          }}>
            Effects Rack
          </h2>
          {isLocked && (
            <div style={{
              position: "absolute",
              right: 0,
              fontSize: "14px",
              color: "#aaa",
              backgroundColor: "#1f1f1f",
              padding: "6px 12px",
              borderRadius: "8px",
              fontWeight: "bold",
              border: "1px solid #555"
            }}>
              🔒 Locked
            </div>
          )}
        </div>

        {/* Dials */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "3rem",
          flexWrap: "wrap",
          marginBottom: "2rem"
        }}>
          {renderDial("Compressor")}
          {renderDial("EQ")}
          {renderDial("Reverb")}
        </div>

        {/* Sliders */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: "24px"
        }}>
          {[...Array(6)].map((_, i) => <div key={i}>{renderSlider()}</div>)}
        </div>
      </div>
    );
  };

  useEffect(() => {
    return () => {
      Tone.Transport.stop();
      Tone.Transport.cancel();

      Tone.Destination.disconnect();
      Tone.Destination.connect(Tone.getContext().destination);


      player?.dispose?.();
      recorder?.dispose?.();
      loop?.dispose?.();
    };
  }, []);

  return (
    <>
      <div className="playground-header">
        <h2 className="pixel-font playground-header-title">Playground</h2>
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

        <div style={{ display: "flex", justifyContent: "center", gap: "3rem", flexWrap: "wrap", marginTop: "2rem" }}>
          <PianoPanel
            disabled={featureLocks.piano}
            isRecording={isRecording}
            selectedTrackId={selectedTrackId}
            updateTrackClip={updateTrackClip}
          />
          <Arpeggiator disabled={featureLocks.arp} />
        </div>


        {isRecording?.analyser && (
          <div>
            <h4 style={{ color: "#ccc" }}>Live Waveform</h4>
            <LiveWaveform analyser={isRecording.analyser} />
          </div>
        )}

        {renderEffectsRack(true)}

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
