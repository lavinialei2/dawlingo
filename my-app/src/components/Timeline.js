import React, { useRef, useState, useEffect } from "react";
import './Timeline.css'
const CONTROL_WIDTH = 160;
const BEAT_WIDTH = 80;
const TRACK_HEIGHT = 80;
const GRID_HEIGHT = 24;
export default function Timeline({
  tracks,
  numBeats,
  selectedTrackId,
  onSelectTrack,
  playheadPosition,
  onMoveClip,
  onDeleteClip,
  onSetClipVolume,
  onScrubPlayhead,
  onVolumeChange,
  onToggleMute,
}) {
  const timelineRef = useRef(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingPlayhead || !timelineRef.current) return;
      const bounds = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - bounds.left - CONTROL_WIDTH;
      const percent = x / (BEAT_WIDTH * numBeats);
      const newPosition = Math.max(0, Math.min(numBeats, percent * numBeats));
      onScrubPlayhead(newPosition);
    };

    const handleMouseUp = () => setIsDraggingPlayhead(false);

    if (isDraggingPlayhead) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingPlayhead, numBeats, onScrubPlayhead]);

  return (
    <div
      ref={timelineRef}
      style={{
        overflowX: "auto",
        overflowY: "visible",
        whiteSpace: "nowrap",
        position: "relative",
        width: "100%",
        backgroundColor: "#1e1e1e",
        padding: "8px 0",
        userSelect: "none",
      }}
    >
      {/* Grid */}
      <div
        style={{
          width: `${CONTROL_WIDTH}px`,
          height: GRID_HEIGHT,
          display: "inline-block",
        }}
      />

      {/* Actual grid */}
      <div
        style={{
          width: `${numBeats * BEAT_WIDTH}px`,
          display: "flex",
          height: GRID_HEIGHT,
          borderBottom: "1px solid #555",
          marginLeft: CONTROL_WIDTH,
        }}
        onClick={(e) => {
          const bounds = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - bounds.left;
          const percent = clickX / bounds.width;
          const newPosition = percent * numBeats;
          onScrubPlayhead(newPosition);
        }}
      >
        {[...Array(numBeats)].map((_, i) => (
          <div
            key={i}
            style={{
              width: `${BEAT_WIDTH}px`,
              borderRight: "1px solid #333",
              textAlign: "center",
              fontSize: "10px",
              color: "#aaa",
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>

      {/* Playhead */}
      <div
        onMouseDown={() => setIsDraggingPlayhead(true)}
        style={{
          position: "absolute",
          top: 0,
          left: `${(playheadPosition / numBeats) * (BEAT_WIDTH * numBeats) +
            CONTROL_WIDTH
            }px`,

          width: "12px",
          marginLeft: "4px",
          height: `${tracks.length * TRACK_HEIGHT + 3 * GRID_HEIGHT}px`,
          zIndex: 10,
          cursor: "ew-resize",
          pointerEvents: "auto",
        }}
      >
        <div
          style={{
            width: "2px",
            height: "100%",
            backgroundColor: "red",
            margin: "0 auto",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Track Lanes */}
      {tracks.map((track) => (
        <div
          key={track.id}
          style={{
            display: "flex",
            height: "80px",
            marginBottom: "4px",
            backgroundColor:
              track.id === selectedTrackId ? "#1a2a3a" : "#2a2a2a",
            border:
              track.id === selectedTrackId
                ? "2px solid #3fa9f5"
                : "1px solid #444",
          }}
        >
          {/* Left Controls Panel */}
          <div
            style={{
              width: `${CONTROL_WIDTH}px`,
              padding: "4px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "4px",
              fontSize: "10px",
              color: "#ccc",
              borderRight: "1px solid #555",
            }}
          >
            <div>
              {/* Commented out for now because styling needs to be adjusted */}
              {/* <strong> {track.instrument || "Instrument"}</strong> */}
            </div>
            <label>
              {/* Volume */}
              <input
                type="range"
                className="volume-slider"
                min={0}
                max={1}
                step={0.01}
                value={track.volume}
                onChange={(e) =>
                  onVolumeChange(track.id, parseFloat(e.target.value))
                }
              />
            </label>
            <button
              className="mute-button"
              onClick={() => onToggleMute(track.id)}
              style={{ fontSize: "10px" }}
            >
              {track.muted ? "Unmute" : "Mute"}
            </button>
          </div>

          {/* Right Clip Area */}
          <div
            style={{
              position: "relative",
              flex: 1,
              height: TRACK_HEIGHT,
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectTrack(track.id);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const draggedTrackId = parseInt(
                e.dataTransfer.getData("trackId")
              );
              const draggedClipIndex = parseInt(
                e.dataTransfer.getData("clipIndex")
              );
              const bounds = e.currentTarget.getBoundingClientRect();
              const dropX = e.clientX - bounds.left;
              const percent = dropX / bounds.width;
              const newStart = percent * numBeats;
              onMoveClip(draggedTrackId, draggedClipIndex, newStart);
            }}
          >
            {track.clips
              .filter((clip) => clip.url || clip.isRecordingClip) // allow recording clips with no URL
              .map((clip, clipIndex) => {
                const clipStartPercent = (clip.start / numBeats) * 100;
                const clipWidthPercent = (clip.duration / numBeats) * 100;

                return (
                  <div
                    key={clipIndex}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("trackId", track.id);
                      e.dataTransfer.setData("clipIndex", clipIndex);
                    }}
                    style={{
                      position: "absolute",
                      top: "2px",
                      left: `${clipStartPercent}%`,
                      width: `${clipWidthPercent}%`,
                      height: TRACK_HEIGHT,
                      backgroundColor: clip.isRecordingClip
                        ? "red"
                        : track.muted
                          ? "#888"
                          : "#3fa9f5",
                      opacity: track.muted ? 0.5 : 1,
                      cursor: "grab",
                      borderRadius: "4px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.3)",
                    }}
                    title={
                      clip.isRecordingClip
                        ? "Recording..."
                        : `Start: ${clip.start.toFixed(2)}s`
                    }
                  />
                );
              })}

          </div>
        </div>
      ))}
    </div>
  );
}
