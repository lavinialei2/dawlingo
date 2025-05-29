import React, { useState, useEffect, useRef } from "react";
import TransportControls from "./components/TransportControls";
import Timeline from "./components/Timeline";
import "./App.css";
import * as Tone from "tone";
import TrackList from "./components/TrackList";
import CongratsModal from "./components/CongratsModal";
import congratsImage from "./assets/lvl1complete.png";
import { useNavigate } from "react-router-dom";
import './Playground.css';
import './Lessons.css'
import lessons from './Lessons';

export default function Lesson1({ onLessonComplete }) {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);

  const lesson = lessons[0].steps;
  const [stepIndex, setStepIndex] = useState(0);
  const isLastStep = stepIndex === lesson.length - 1;

  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  const addTrackButtonRef = useRef(null);
  const playButtonRef = useRef(null);
  const recordRef = useRef(null);
  const deleteTrackButtonRef = useRef(null);
  const resetPlayheadRef = useRef(null);
  const playheadRef = useRef(null);
  const volumeRef = useRef(null);
  const muteRef = useRef(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const [hasInteracted, setHasInteracted] = useState(false);


  const navigateToHome = () => {
    navigate('/home');
  };

  const navigateToPlayground = () => {
    navigate('/playground')
  };

  useEffect(() => {
    const completed = localStorage.getItem("lesson1Complete") === "true";
    setLessonComplete(completed);
  }, []);

  useEffect(() => {
  if (stepIndex === 0 || stepIndex === 1) {
    setHasInteracted(true); 
  } else {
    setHasInteracted(false); 
  }
}, [stepIndex]);

  useEffect(() => {
    let id;

    const update = () => {
      setPlayheadPosition(Tone.Transport.seconds);
      id = requestAnimationFrame(update);
    };

    id = requestAnimationFrame(update); // always run the loop

    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
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

  useEffect(() => {
    let targetRef;
    if (lesson[stepIndex].target === "addTrack") {
      targetRef = addTrackButtonRef;
    } else if (lesson[stepIndex].target === "playButton") {
      targetRef = playButtonRef;
    } else if (lesson[stepIndex].target === "recordButton") {
      targetRef = recordRef;
    } else if (lesson[stepIndex].target === "resetPlayhead") {
      targetRef = resetPlayheadRef;
    } else if (lesson[stepIndex].target === "playheadSlider") {
      targetRef = playheadRef;
    } else if (lesson[stepIndex].target === "volume") {
      targetRef = volumeRef;
    } else if (lesson[stepIndex].target === "mute") {
      targetRef = muteRef;
    } else if (lesson[stepIndex].target === "delete") {
      targetRef = deleteTrackButtonRef;
    }

    if (targetRef?.current) {
      const rect = targetRef.current.getBoundingClientRect();
      const isArrowLeft = (stepIndex === 6 || stepIndex === 7 || stepIndex === 9);
      const extraOffsetX = isArrowLeft ? 70 : 0;
      setPopupPosition({
        top: rect.top + window.scrollY + 50, 
        left: rect.left + window.scrollX + rect.width / 2 + extraOffsetX
      });
    }
  }, [stepIndex]);


  const onScrubPlayhead = (positionInSeconds) => {
    Tone.Transport.seconds = positionInSeconds;
    setPlayheadPosition(positionInSeconds);
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
  
    // 🔑 Mark step complete if this is the mute step
    if (lesson[stepIndex]?.target === "mute") {
      setHasInteracted(true);
    }
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

    // 🔍 NEW: AnalyserNode for waveform
    const analyser = Tone.context.createAnalyser();
    analyser.fftSize = 2048;

    // Hacky way to access media stream node directly from Tone.UserMedia
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
      analyser, // 📦 Store analyser for waveform
    });
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
    const recording = await isRecording.rec.stop();
    const blob = new Blob([recording], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);

    const clip = {
      url,
      start: isRecording.startTime,
      duration: 0,
      volume: 1,
      waveform: null, // temp — will be filled later
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



  const handleLessonComplete = () => {
    const currentHighest = parseInt(localStorage.getItem("highestLessonCompleted") || "0");

    // Lesson 1 is index 0
    if (currentHighest < 1) {
      localStorage.setItem("highestLessonCompleted", "1");
    }

    setLessonComplete(true);
    localStorage.setItem("lesson1Complete", "true");

    if (onLessonComplete) onLessonComplete("lesson1");

    setShowCongrats(true);
  };


  return (
    <>
    {stepIndex < lesson.length && (
  <div
    className={`lesson-popup 
      ${lesson[stepIndex].hasArrow ? "with-arrow" : ""}
      ${(stepIndex === 6 || stepIndex === 7 || stepIndex === 9) ? "arrow-left" : "arrow-center"}`}
    style={{
      position: (stepIndex === 0 || stepIndex === 1) ? "fixed" : "absolute",
      top: (stepIndex === 0 || stepIndex === 1) ? "50%" : popupPosition.top,
      left: (stepIndex === 0 || stepIndex === 1) ? "50%" : popupPosition.left,
      transform: (stepIndex === 0 || stepIndex === 1) ? "translate(-50%, -50%)" : "translate(-50%, 0%)",
    }}
  >
    <h4>{lesson[stepIndex].title}</h4>
    <p>{lesson[stepIndex].text}</p>
    {/* <button className="lesson-button" onClick={() => setStepIndex(stepIndex + 1)}>Next</button> */}
    {isLastStep ? (
      <button
        className="lesson-button"
        onClick={handleLessonComplete}
        disabled={!hasInteracted || lessonComplete}
      >
        {"Complete Lesson"}
      </button>
    ) : (
      <button
        className="lesson-button"
        onClick={() => setStepIndex(stepIndex + 1)}
        disabled={!hasInteracted}
      >Next
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
          setIsPlaying={setIsPlaying} 
          stepIndex={stepIndex} 
          setHasInteracted={setHasInteracted}
          lesson={lesson} 
        />
      <button 
        ref={addTrackButtonRef} 
        // onClick={addTrack}
          className={lesson[stepIndex]?.target === "addTrack" ? "highlight-button" : ""}
          onClick={() => {
            addTrack();
            if (lesson[stepIndex]?.target === "addTrack") {
              setHasInteracted(true);  
            }
          }}
      >Add Track</button>
        <button
          ref={recordRef}
          className={lesson[stepIndex]?.target === "recordButton" ? "highlight-button" : ""}
          disabled={!selectedTrackId}
          onClick={() => {
            if (isRecording) {
              stopRecording();
            } else {
              startRecording();
            }
            if (lesson[stepIndex]?.target === "recordButton") {
              setHasInteracted(true);
            }
          }}
        >
          {isRecording ? "Stop Recording" : "Record"}
        </button>
        <button
          ref={deleteTrackButtonRef}
          className={lesson[stepIndex]?.target === "delete" ? "highlight-button" : ""}
          onClick={() => {
            deleteSelectedTrack();
            if (lesson[stepIndex]?.target === "delete") {
              setHasInteracted(true);
            }
          }}
          disabled={!selectedTrackId}
          style={{ marginLeft: "8px" }}
        >
          Delete Track
        </button>
        <button 
          ref={resetPlayheadRef} 
          className={lesson[stepIndex]?.target === "resetPlayhead" ? "highlight-button" : ""}
          onClick={() => {
            onScrubPlayhead(0);
            if (lesson[stepIndex]?.target === "resetPlayhead") {
              setHasInteracted(true);
            }
          }}
        >
          Reset Playhead
        </button>

        <br />
        <label>Playhead:</label>
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
            if (lesson[stepIndex]?.target === "playheadSlider") {
              setHasInteracted(true);
            }
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
        onSelectTrack={handleTrackSelect}
        playheadPosition={playheadPosition}
        onMoveClip={onMoveClip}
        onDeleteClip={onDeleteClip}
        onSetClipVolume={onSetClipVolume}
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
  </>
  
  );
}
