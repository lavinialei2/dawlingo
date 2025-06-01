import { useState, useEffect, useRef, useCallback } from "react";
import * as Tone from "tone";
import { samplers } from "./samplers";

export const DAWEngine = () => {
  const [tracks, setTracks] = useState([]);
  const [selectedTrackId, setSelectedTrackId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPosition, setPlayheadPosition] = useState(0);
  const scheduledParts = useRef([]);


  const startRecording = async () => {
    if (!selectedTrackId) return;

    const track = tracks.find((t) => t.id === selectedTrackId);
    if (!track) return;

    const startTime = Tone.Transport.seconds;

    if (track.instrument === "microphone") {
      await Tone.start();
      const mic = new Tone.UserMedia();
      await mic.open();

      const rec = new Tone.Recorder();
      mic.connect(rec);
      rec.start();

      if (Tone.Transport.state !== "started") Tone.Transport.start();
      setIsPlaying(true);

      const analyser = Tone.context.createAnalyser();
      analyser.fftSize = 2048;
      mic._mediaStream.connect(analyser);

      setTracks((prev) =>
        prev.map((t) =>
          t.id === selectedTrackId
            ? {
              ...t,
              clips: [
                ...t.clips,
                {
                  url: null,
                  start: startTime,
                  duration: 0,
                  volume: 1,
                  isRecordingClip: true,
                },
              ],
            }
            : t
        )
      );

      setIsRecording({ mic, rec, startTime, analyser });
    } else if (track.instrument === "piano") {
      if (Tone.Transport.state !== "started") Tone.Transport.start();
      setIsPlaying(true);

      setTracks((prev) =>
        prev.map((t) =>
          t.id === selectedTrackId
            ? {
              ...t,
              clips: [
                ...t.clips,
                {
                  start: startTime,
                  duration: 0,
                  volume: 1,
                  isRecordingClip: true,
                  isVirtual: true,
                  notes: [],
                },
              ],
            }
            : t
        )
      );

      setIsRecording({ startTime });
    }
  };

  const stopRecording = useCallback(async () => {
    if (!isRecording || !selectedTrackId) return;
    const track = tracks.find((t) => t.id === selectedTrackId);
    const endTime = Tone.Transport.seconds;

    if (track.instrument === "microphone") {
      const recording = await isRecording.rec.stop();
      const blob = new Blob([recording], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);

      const player = new Tone.Player({
        url,
        autostart: false,
        onload: () => {
          const clip = {
            url,
            start: isRecording.startTime,
            duration: player.buffer.duration,
            volume: 1,
            waveform: null,
            player,
          };
          player.connect(track.gainNode);
          player.sync().start(clip.start);

          setTracks((prev) =>
            prev.map((t) =>
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
    } else if (track.instrument === "piano") {
      const recordingClip = track.clips.find(
        (clip) => clip.isRecordingClip && clip.isVirtual
      );
      if (!recordingClip) return;

      const finalized = {
        ...recordingClip,
        isRecordingClip: false,
        duration: endTime - recordingClip.start,
      };

      setTracks((prev) =>
        prev.map((t) =>
          t.id === selectedTrackId
            ? {
              ...t,
              clips: [
                ...t.clips.filter((c) => c !== recordingClip),
                finalized,
              ],
            }
            : t
        )
      );

      setIsRecording(false);
    }
  }, [isRecording, selectedTrackId, tracks]);


  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => {
      const newVal = !prev;
      if (newVal) {
        Tone.Transport.start();
      } else {
        Tone.Transport.pause();
        if (isRecording) {
          stopRecording();  // Ensure recording stops when paused
        }
      }
      return newVal;
    });
  }, [isRecording, stopRecording])


  const onScrubPlayhead = (seconds) => {
    Tone.Transport.seconds = seconds;
    setPlayheadPosition(seconds);
  };

  const addTrack = (instrumentType) => {
    const id = Date.now();
    const newTrack = {
      id,
      clips: [],
      volume: 1,
      muted: false,
      instrument: instrumentType,
      gainNode: new Tone.Gain(1).toDestination(),
    };
    setTracks((prev) => [...prev, newTrack]);
    setSelectedTrackId(id);
  };

  const deleteTrack = (id) => {
    const track = tracks.find((t) => t.id === id);
    if (track) {
      track.clips.forEach((clip) => {
        if (clip.player && typeof clip.player.dispose === "function") {
          try {
            clip.player.unsync();
            clip.player.stop();
            clip.player.dispose();
          } catch (e) {
            console.warn("Failed to dispose player", e);
          }
        }
      });
    }
    setTracks((prev) => prev.filter((t) => t.id !== id));
    if (selectedTrackId === id) setSelectedTrackId(null);
  };

  const updateTrackClip = (id, clipOrUpdater) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
            ...t,
            clips: typeof clipOrUpdater === "function"
              ? clipOrUpdater(t.clips || [])
              : [...(t.clips || []), clipOrUpdater],
          }
          : t
      )
    );
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
  };

  const moveClip = (trackId, clipIndex, newStart) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId
          ? {
            ...t,
            clips: t.clips.map((clip, i) =>
              i === clipIndex ? { ...clip, start: Math.max(0, newStart) } : clip
            ),
          }
          : t
      )
    );
  };

  const deleteClip = (trackId, clipIndex) => {
    setTracks((prev) =>
      prev.map((t) =>
        t.id === trackId
          ? { ...t, clips: t.clips.filter((_, i) => i !== clipIndex) }
          : t
      )
    );
  };

  const setClipVolume = (trackId, clipIndex, volume) => {
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


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay]);

  useEffect(() => {
    let id;
    const loop = () => {
      setPlayheadPosition(Tone.Transport.seconds);
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!isRecording || !selectedTrackId) return;
    let id;
    const update = () => {
      const now = Tone.Transport.seconds;
      setTracks((prev) =>
        prev.map((t) =>
          t.id === selectedTrackId
            ? {
              ...t,
              clips: t.clips.map((clip) =>
                clip.isRecordingClip ? { ...clip, duration: now - clip.start } : clip
              ),
            }
            : t
        )
      );
      id = requestAnimationFrame(update);
    };
    id = requestAnimationFrame(update);
    return () => cancelAnimationFrame(id);
  }, [isRecording, selectedTrackId]);


  useEffect(() => {
    if (!isPlaying && !isRecording) return;

    scheduledParts.current.forEach((p) => p.dispose());
    scheduledParts.current = [];

    tracks.forEach((track) => {
      if (track.instrument !== "piano" || track.muted) return;

      track.clips.forEach((clip) => {
        if (clip.isRecordingClip || !clip.notes || clip.notes.length === 0) return;

        const part = new Tone.Part(
          (time, { note, duration }) => {
            samplers.piano.triggerAttackRelease(note, duration || "8n", time);
          },
          clip.notes.map(({ note, start, duration }) => [
            start - clip.start,
            { note, duration },
          ])
        );

        part.start(clip.start);
        scheduledParts.current.push(part);
      });
    });

    return () => {
      scheduledParts.current.forEach((p) => p.dispose());
      scheduledParts.current = [];
    };
  }, [isPlaying, isRecording, tracks]);


  return {
    tracks,
    selectedTrackId,
    setSelectedTrackId,
    isRecording,
    isPlaying,
    playheadPosition,
    setPlayheadPosition,
    togglePlay,
    startRecording,
    stopRecording,
    onScrubPlayhead,
    addTrack,
    deleteTrack,
    updateTrackClip,
    updateTrackVolume,
    toggleMuteTrack,
    moveClip,
    deleteClip,
    setClipVolume,
  };
};
