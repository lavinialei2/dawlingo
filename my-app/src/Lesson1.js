import React, { useState, useEffect, useRef } from "react";
import TransportControls from "./components/TransportControls";
import Timeline from "./components/Timeline";
import CongratsModal from "./components/CongratsModal";
import congratsImage from "./assets/lvl1complete.png";
import { useNavigate } from "react-router-dom";
import "./App.css";
import "./Playground.css";
import "./Lessons.css";
import lessons from "./Lessons";
import { DAWEngine } from "./components/DAWEngine";

export default function Lesson1({ onLessonComplete }) {
  const navigate = useNavigate();
  const lesson = lessons[0].steps;
  const [stepIndex, setStepIndex] = useState(0);
  const isLastStep = stepIndex === lesson.length - 1;
  const [showCongrats, setShowCongrats] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

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

  useEffect(() => {
    onScrubPlayhead(0); // reset playhead to the start on initial load
  }, []);

  useEffect(() => {
    const highest = parseInt(localStorage.getItem("highestLessonCompleted") || "0");
    setLessonComplete(highest >= 1);
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
    };
    const targetRef = refs[targetKey];

    if (targetRef?.current) {
      const rect = targetRef.current.getBoundingClientRect();
      const isArrowLeft = [6, 7, 9].includes(stepIndex);
      const extraOffsetX = isArrowLeft ? 70 : 0;
      setPopupPosition({
        top: rect.top + window.scrollY + 50,
        left: rect.left + window.scrollX + rect.width / 2 + extraOffsetX + 30,
      });
    }
  }, [stepIndex]);

  const navigateToHome = () => navigate("/home");

  const handleLessonComplete = () => {
    const currentHighest = parseInt(localStorage.getItem("highestLessonCompleted") || "0");
    if (currentHighest < 1) {
      localStorage.setItem("highestLessonCompleted", "1");
    }
    setLessonComplete(true);
    if (onLessonComplete) onLessonComplete("lesson1");
    setShowCongrats(true);
  };


  return (
    <>
      {stepIndex < lesson.length && (
        <div
          className={`lesson-popup ${lesson[stepIndex].hasArrow ? "with-arrow" : ""} ${(stepIndex === 6 || stepIndex === 7 || stepIndex === 9) ? "arrow-left" : "arrow-center"}`}
          style={{
            position: [0, 1].includes(stepIndex) ? "fixed" : "absolute",
            top: [0, 1].includes(stepIndex) ? "50%" : popupPosition.top,
            left: [0, 1].includes(stepIndex) ? "50%" : popupPosition.left,
            transform: [0, 1].includes(stepIndex) ? "translate(-50%, -50%)" : "translate(-50%, 0%)",
          }}
        >
          <h4>{lesson[stepIndex].title}</h4>
          <p>{lesson[stepIndex].text}</p>
          {isLastStep ? (
            <button className="lesson-button" onClick={handleLessonComplete} disabled={!hasInteracted || lessonComplete}>
              Complete Lesson
            </button>
          ) : (
            <button className="lesson-button" onClick={() => setStepIndex(stepIndex + 1)} disabled={!hasInteracted}>
              Next
            </button>
          )}
        </div>
      )}

      <div className="playground-header">
        <h2 className="pixel-font playground-header-title">Lesson 1: Intro to the DAW</h2>
        <button className="home-button" onClick={navigateToHome}>Home</button>
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
              addTrack("microphone");
              if (lesson[stepIndex]?.target === "addTrack") setHasInteracted(true);
            }}
          >
            Add Track
          </button>

          <button
            ref={recordRef}
            className={lesson[stepIndex]?.target === "recordButton" ? "highlight-button" : ""}
            disabled={!selectedTrackId}
            onClick={() => {
              isRecording ? stopRecording() : startRecording();
              if (lesson[stepIndex]?.target === "recordButton") setHasInteracted(true);
            }}
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

        {showCongrats && (
          <CongratsModal
            image={congratsImage}
            onClose={() => setShowCongrats(false)}
            onReturnHome={() => setTimeout(() => navigate("/home"), 50)}
          />
        )}
      </div>
    </>
  );
}
