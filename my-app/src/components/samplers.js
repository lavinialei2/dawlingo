import * as Tone from "tone";

export const samplers = {
  piano: new Tone.Sampler({
    urls: {
      C4: "C4.mp3",
      "D#4": "Ds4.mp3",
      "F#4": "Fs4.mp3",
      A4: "A4.mp3",
    },
    baseUrl: "https://tonejs.github.io/audio/salamander/",
  }).toDestination(),

  // You can define other instruments here too, like:
  // guitar: new Tone.PluckSynth().toDestination()
};
