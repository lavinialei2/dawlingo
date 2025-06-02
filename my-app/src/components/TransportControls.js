import React from "react";
import * as Tone from "tone";

export default function TransportControls({
  isPlaying,
  setIsPlaying,
  playButtonRef,
  stepIndex,
  setHasInteracted,
  lesson
}) {
  const handlePlayPause = async () => {
    await Tone.start();
    if (Tone.Transport.state === "started") {
      Tone.Transport.pause();
      setIsPlaying(false);
    } else {
      Tone.Transport.stop();
      Tone.Transport.start();
      setIsPlaying(true);
    }

    // ✅ Defensive guard to avoid error
    if (lesson && lesson[stepIndex]?.target === "playButton") {
      setHasInteracted?.(true);
    }
  };

  const isHighlight = lesson?.[stepIndex]?.target === "playButton";

  return (
    <button
      ref={playButtonRef}
      className={isHighlight ? "highlight-button" : ""}
      onClick={handlePlayPause}
    >
      {isPlaying ? "Pause" : "Play"}
    </button>
  );
}
