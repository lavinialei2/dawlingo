import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

export default function usePianoSampler() {
  const samplerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const sampler = new Tone.Sampler({
      urls: {
        C4: "C4.mp3",
        "D#4": "Ds4.mp3",
        "F#4": "Fs4.mp3",
        A4: "A4.mp3",
      },
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      onload: () => {
        console.log("Sampler loaded");
        setLoaded(true);
      },
    }).toDestination();

    samplerRef.current = sampler;

    return () => sampler.dispose(); // cleanup
  }, []);

  const playNote = async (note) => {
    if (!loaded || !samplerRef.current) return;
    await Tone.start();
    samplerRef.current.triggerAttackRelease(note, "8n", Tone.now());
  };

  return { playNote, loaded };
}
