import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Arpeggiator from "./components/ArpeggiatorPanel";
import CongratsModal from "./components/CongratsModal";
import lessons from "./Lessons";
import congratsImage from "./assets/lvl2complete.png"; // update this later
import "./App.css";
import "./Playground.css";
import "./Lessons.css";

export default function Lesson3({ onLessonComplete }) {
    const navigate = useNavigate();
    const lesson = lessons[2].steps;
    const [stepIndex, setStepIndex] = useState(0);
    const isLastStep = stepIndex === lesson.length - 1;
    const [showCongrats, setShowCongrats] = useState(false);
    const [lessonComplete, setLessonComplete] = useState(false);
    const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });

    const keySelectRef = useRef(null);
    const progressionButtonsRef = useRef(null);
    const playbackModeRef = useRef(null);
    const startStopRef = useRef(null);

    useEffect(() => {
        const highest = parseInt(localStorage.getItem("highestLessonCompleted") || "0");
        setLessonComplete(highest >= 3);
    }, []);

    useEffect(() => {
        const refs = {
            keySelect: keySelectRef,
            progressionButtons: progressionButtonsRef,
            playbackMode: playbackModeRef,
            startStop: startStopRef,
        };
        const targetKey = lesson[stepIndex].target;
        const targetRef = refs[targetKey];

        if (targetRef?.current) {
            const rect = targetRef.current.getBoundingClientRect();
            setPopupPosition({
                top: rect.bottom + window.scrollY + 10,
                left: rect.left + window.scrollX + rect.width / 2,
            });
        } else {
            setPopupPosition({ top: window.innerHeight * 0.4, left: window.innerWidth * 0.75 });
        }
    }, [stepIndex]);

    const handleLessonComplete = () => {
        const highest = parseInt(localStorage.getItem("highestLessonCompleted") || "0");
        if (highest < 3) {
            localStorage.setItem("highestLessonCompleted", "3");
        }
        setLessonComplete(true);
        if (onLessonComplete) onLessonComplete("lesson3");
        setShowCongrats(true);
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
            {stepIndex < lesson.length && (
                <div
                    className={`lesson-popup ${lesson[stepIndex].hasArrow ? "with-arrow" : ""}`}
                    style={{
                        position: "absolute",
                        top: popupPosition.top,
                        left: popupPosition.left,
                        transform: "translate(-50%, 0%)",
                    }}
                >
                    <h4>{lesson[stepIndex].title}</h4>
                    <p>{lesson[stepIndex].text}</p>
                    <button
                        className="lesson-button"
                        onClick={isLastStep ? handleLessonComplete : () => setStepIndex(stepIndex + 1)}
                    >
                        {isLastStep ? "Complete Lesson" : "Next"}
                    </button>
                </div>
            )}

            <div className="playground-header">
                <h2 className="pixel-font playground-header-title">Lesson 3: Chord Progressions</h2>
                <button className="home-button" onClick={() => navigate("/home")}>Home</button>
            </div>

            <div className="playground-container">
                <Arpeggiator
                    keySelectRef={keySelectRef}
                    progressionButtonsRef={progressionButtonsRef}
                    playbackModeRef={playbackModeRef}
                    startStopRef={startStopRef}
                />
            </div>

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