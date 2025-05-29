import React from "react";
import * as Tone from "tone";

export default function TransportControls({ isPlaying, setIsPlaying, playButtonRef, stepIndex, setHasInteracted, lesson }) {
    const handlePlayPause = async () => {
        await Tone.start();
        if (Tone.Transport.state === "started") {
          Tone.Transport.pause();
          setIsPlaying(false);
        } else {
          Tone.Transport.stop();  // 🔁 reset to beginning
          Tone.Transport.start(); // ▶️ play all synced clips
          setIsPlaying(true);
        }
        if (lesson[stepIndex]?.target === "playButton") {
        setHasInteracted(true);
        }
      };
      

  return <button 
          ref={playButtonRef} 
          className={lesson[stepIndex]?.target === "playButton" ? "highlight-button" : ""}
          onClick={handlePlayPause}>{isPlaying ? "Pause" : "Play"}</button>;
}