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

  const addTrackButtonRef = useRef(null);
  const playButtonRef = useRef(null);
  const recordRef = useRef(null);
  const deleteTrackButtonRef = useRef(null);
  const resetPlayheadRef = useRef(null);
  const playheadRef = useRef(null);
  const volumeRef = useRef(null);
  const muteRef = useRef(null);
  const pianoRef = useRef(null);

  useEffect(() => {
    const highest = parseInt(localStorage.getItem("highestLessonCompleted") || "0");
    setLessonComplete(highest >= 2);
  }, []);

  useEffect(() => {
    setHasInteracted(stepIndex <= 1);
  }, [stepIndex]);

  useEffect(() => {
    const targetKey = lesson[stepIndex].target;
    const refs = {
      addTrack: addTrackButtonRef,
      playButton: playButtonRef,
      recordButton: recordRef,
      resetPlayhead: resetPlayheadRef,
      playheadSlider: playheadRef,
      volume: volumeRef,
      mute: muteRef,
      delete: deleteTrackButtonRef,
      piano: pianoRef,
    };
    const targetRef = refs[targetKey];

    if (targetRef?.current) {
      const rect = targetRef.current.getBoundingClientRect();
      const isArrowLeft = [6, 7, 9].includes(stepIndex);
      const extraOffsetX = isArrowLeft ? 70 : 0;
      setPopupPosition({
        top: rect.bottom + window.scrollY + 10,
        left: rect.left + window.scrollX + rect.width / 2 + extraOffsetX,
      });
    } else {
      setPopupPosition({ top: window.innerHeight * 0.64, left: window.innerWidth / 2 });
    }
  }, [stepIndex]);

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
          className={`lesson-popup ${lesson[stepIndex].hasArrow ? "with-arrow" : ""} ${(stepIndex === 6 || stepIndex === 7 || stepIndex === 9) ? "arrow-left" : "arrow-center"}`}
          style={{
            position: lesson[stepIndex]?.target === "none" ? "absolute" : "absolute",
            top: lesson[stepIndex]?.target === "none" ? popupPosition.top : popupPosition.top,
            left: popupPosition.left,
            transform: "translate(-50%, 0%)",
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
            playButtonRef={playButtonRef}
            isPlaying={isPlaying}
            setIsPlaying={togglePlay}
            stepIndex={stepIndex}
            setHasInteracted={setHasInteracted}
            lesson={lesson}
          />

          <button
            ref={addTrackButtonRef}
            className={lesson[stepIndex]?.target === "addTrack" ? "highlight-button" : ""}
            onClick={() => {
              setShowInstrumentModal(true);
              if (lesson[stepIndex]?.target === "addTrack") setHasInteracted(true);
            }}
          >
            Add Track
          </button>

          <button
            ref={recordRef}
            className={lesson[stepIndex]?.target === "recordButton" ? "highlight-button" : ""}
            onClick={() => {
              isRecording ? stopRecording() : startRecording();
              if (lesson[stepIndex]?.target === "recordButton") setHasInteracted(true);
            }}
            disabled={!selectedTrackId}
          >
            {isRecording ? "Stop Recording" : "Record"}
          </button>

          <button
            ref={deleteTrackButtonRef}
            className={lesson[stepIndex]?.target === "delete" ? "highlight-button" : ""}
            onClick={() => {
              deleteTrack(selectedTrackId);
              if (lesson[stepIndex]?.target === "delete") setHasInteracted(true);
            }}
            disabled={!selectedTrackId}
          >
            Delete Track
          </button>

          <button
            ref={resetPlayheadRef}
            className={lesson[stepIndex]?.target === "resetPlayhead" ? "highlight-button" : ""}
            onClick={() => {
              onScrubPlayhead(0);
              if (lesson[stepIndex]?.target === "resetPlayhead") setHasInteracted(true);
            }}
          >
            Reset Playhead
          </button>

          <input
            ref={playheadRef}
            className={lesson[stepIndex]?.target === "playheadSlider" ? "highlight-button" : ""}
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
          playheadRef={playheadRef}
          volumeRef={volumeRef}
          muteRef={muteRef}
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
          ref={pianoRef}
          onKeyPress={() => {
            if (lesson[stepIndex]?.target === "piano") setHasInteracted(true);
          }}
        />

        {/* {isRecording?.analyser && (
          <>
            <h4 style={{ color: "#ccc" }}>Live Waveform</h4>
            <LiveWaveform analyser={isRecording.analyser} />
          </>
        )} */}
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