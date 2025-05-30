import React, { useState, useEffect, useRef } from "react";
import TransportControls from "./components/TransportControls";
import Timeline from "./components/Timeline";
import InstrumentSelectModal from "./components/InstrumentSelectModal";
import CongratsModal from "./components/CongratsModal";
import PianoPanel from "./components/PianoPanel";
import LiveWaveform from "./components/LiveWaveform";

import congratsImage from "./assets/lvl2complete.png";
import { useNavigate } from "react-router-dom";
import "./App.css";
import "./Playground.css";
import "./Lessons.css";
import lessons from "./Lessons";
import { DAWEngine } from "./components/DAWEngine";

export default function Lesson2({ onLessonComplete }) {
  const navigate = useNavigate();
  const lesson = lessons[1].steps;
  const [stepIndex, setStepIndex] = useState(0);
  const isLastStep = stepIndex === lesson.length - 1;
  const [showCongrats, setShowCongrats] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [showInstrumentModal, setShowInstrumentModal] = useState(false);
  const [lessonComplete, setLessonComplete] = useState(false);

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

  const refs = {
    addTrack: useRef(null),
    playButton: useRef(null),
    recordButton: useRef(null),
    delete: useRef(null),
    resetPlayhead: useRef(null),
    playheadSlider: useRef(null),
    volume: useRef(null),
    mute: useRef(null),
  };

  useEffect(() => {
    const highest = parseInt(localStorage.getItem("highestLessonCompleted") || "0");
    setLessonComplete(highest >= 2);
  }, []);

  useEffect(() => {
    setHasInteracted(stepIndex <= 1);
  }, [stepIndex]);

  useEffect(() => {
    const key = lesson[stepIndex].target;
    if (key && refs[key]?.current) {
      const rect = refs[key].current.getBoundingClientRect();
      setPopupPosition({
        top: rect.top + window.scrollY + 50,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, lesson]);

  const handleLessonComplete = () => {
    const highest = parseInt(localStorage.getItem("highestLessonCompleted") || "0");
    if (highest < 2) {
      localStorage.setItem("highestLessonCompleted", "2");
    }
    setLessonComplete(true);
    if (onLessonComplete) onLessonComplete("lesson2");
    setShowCongrats(true);
  };

  return (
    <>
      {stepIndex < lesson.length && (
        <div
          className={`lesson-popup ${lesson[stepIndex].hasArrow ? "with-arrow" : ""}`}
          style={{
            position: stepIndex <= 1 ? "fixed" : "absolute",
            top: stepIndex <= 1 ? "50%" : popupPosition.top,
            left: stepIndex <= 1 ? "50%" : popupPosition.left,
            transform: stepIndex <= 1 ? "translate(-50%, -50%)" : "translate(-50%, 0%)",
          }}
        >
          <h4>{lesson[stepIndex].title}</h4>
          <p>{lesson[stepIndex].text}</p>
          <button
            className="lesson-button"
            onClick={isLastStep ? handleLessonComplete : () => setStepIndex(stepIndex + 1)}
            disabled={!hasInteracted || (isLastStep && lessonComplete)}
          >
            {isLastStep ? "Complete Lesson" : "Next"}
          </button>
        </div>
      )}

      <div className="playground-header">
        <h2 className="pixel-font playground-header-title">Lesson 2</h2>
        <button className="home-button" onClick={() => navigate("/home")}>Home</button>
      </div>

      <div className="playground-container">
        <div className="playground-controls">
          <TransportControls
            playButtonRef={refs.playButton}
            isPlaying={isPlaying}
            setIsPlaying={togglePlay}
            stepIndex={stepIndex}
            setHasInteracted={setHasInteracted}
            lesson={lesson}
          />

          <button ref={refs.addTrack} onClick={() => setShowInstrumentModal(true)}>Add Track</button>

          <button
            ref={refs.recordButton}
            onClick={() => {
              isRecording ? stopRecording() : startRecording();
              if (lesson[stepIndex]?.target === "recordButton") setHasInteracted(true);
            }}
            disabled={!selectedTrackId}
          >
            {isRecording ? "Stop Recording" : "Record"}
          </button>

          <button
            ref={refs.delete}
            onClick={() => deleteTrack(selectedTrackId)}
            disabled={!selectedTrackId}
          >
            Delete Track
          </button>

          <button
            ref={refs.resetPlayhead}
            onClick={() => onScrubPlayhead(0)}
          >
            Reset Playhead
          </button>

          <input
            ref={refs.playheadSlider}
            type="range"
            min={0}
            max={60}
            step={0.1}
            value={playheadPosition}
            onChange={(e) => {
              onScrubPlayhead(parseFloat(e.target.value));
              if (lesson[stepIndex]?.target === "playheadSlider") setHasInteracted(true);
            }}
            disabled={isPlaying}
          />
        </div>

        <Timeline
          playheadRef={refs.playheadSlider}
          volumeRef={refs.volume}
          muteRef={refs.mute}
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
          stepIndex={stepIndex}
          setHasInteracted={setHasInteracted}
          lesson={lesson}
        />

        <PianoPanel
          isRecording={isRecording}
          selectedTrackId={selectedTrackId}
          updateTrackClip={updateTrackClip}
        />

        {isRecording?.analyser && (
          <>
            <h4 style={{ color: "#ccc" }}>Live Waveform</h4>
            <LiveWaveform analyser={isRecording.analyser} />
          </>
        )}
      </div>

      {showInstrumentModal && (
        <InstrumentSelectModal
          onSelect={(instrument) => {
            addTrack(instrument);
            setShowInstrumentModal(false);
            if (lesson[stepIndex]?.target === "addTrack") setHasInteracted(true);
          }}
          onClose={() => setShowInstrumentModal(false)}
        />
      )}

      {showCongrats && (
        <CongratsModal
          image={congratsImage}
          onClose={() => setShowCongrats(false)}
          onReturnHome={() => navigate("/home")}
        />
      )}
    </>
  );
}
