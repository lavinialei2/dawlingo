const lessons = [
  {
    title: "Lesson 1: Intro to the DAW",
    steps: [
      {
        title: "Welcome!",
        text: "Let's get started on your first lesson.",
        target: "none",
        hasArrow: false
      },
      {
        title: "DAW",
        text: "DAW stands for Digital Audio Workstation. It is a software where you can record/edit tracks and more.",
        target: "none",
        hasArrow: false
      },
      {
        title: "Add a Track",
        text: "Click the 'Add Track' button to create a new track. The selected track will be outlined in blue. Click next once you have added a track.",
        target: "addTrack",
        hasArrow: true
      },
      {
        title: "Record",
        text: "Now click the 'Record' button to begin recording. Press 'Stop Recording' to stop the recording.",
        target: "recordButton",
        hasArrow: true
      },
      {
        title: "Pause",
        text: "Press 'Pause' to stop the playhead as well.",
        target: "playButton",
        hasArrow: true
      },
      {
        title: "Playhead",
        text: "The playhead is the red vertical line that shows your current position in the track. To set the playhead back to the beginning of the track, press 'Reset Playhead'.",
        target: "resetPlayhead",
        hasArrow: true
      },
      {
        title: "Play",
        text: "Press 'Play' to listen to your recording. After listening, press 'Pause' to stop.",
        target: "playButton",
        hasArrow: true
      },
      {
        title: "Playhead",
        text: "You can also use the slider to adjust the playhead to where you want it. Make sure the playhead is paused before adjusting it.",
        target: "playheadSlider",
        hasArrow: true
      },
      {
        title: "Volume",
        text: "Adjust the slider to change the volume of your track.",
        target: "volume",
        hasArrow: true
      },
      {
        title: "Multiple tracks",
        text: "Now let's add a new track. Click on the track and record.",
        target: "addTrack",
        hasArrow: true
      },
      {
        title: "Mute Button",
        text: "Press the 'mute' button to mute a track. Reset the playhead and press 'play'. Press play and notice how only the unmuted track has audio.",
        target: "mute",
        hasArrow: true
      },
      {
        title: "Delete Button",
        text: "Now select a track and click 'delete' to remove that track.",
        target: "delete",
        hasArrow: true
      },
    ],
  },
  {
    title: "Lesson 2: Piano MIDI",
    steps: [
      {
        title: "Welcome to Lesson 2!",
        text: "In this lesson, you'll learn how to add virtual instruments like the piano to your tracks.",
        target: "none",
        hasArrow: false
      },
      {
        title: "Piano",
        text: "Try out the virtual piano using your keyboard! The keys are labeled with their pitches and a corresponding QWERTY key.",
        target: "none",
        hasArrow: false
      },
      {
        title: "Add a Track",
        text: "Click the 'Add Track' button to create a new track. Choose the piano option.",
        target: "addTrack",
        hasArrow: true
      },
      {
        title: "Record",
        text: "Press record, and start playing the piano. Notice the piano roll that shows up. Stop when you're done.",
        target: "recordButton",
        hasArrow: true
      },
      {
        title: "Playback",
        text: "Pause the playhead, reset the playhead, and press play to listen to your piano track.",
        target: "playButton",
        hasArrow: false,
      },
      {
        title: "Add another Track",
        text: "Now add a microphone track!",
        target: "addTrack",
        hasArrow: true
      },
      {
        title: "Record",
        text: "Reset the playhead, and record yourself alongside the piano.",
        target: "recordButton",
        hasArrow: true
      },
      {
        title: "Playback",
        text: "Pause the playhead, reset the playhead, and press play to listen to your piano and microphone duet!",
        target: "playButton",
        hasArrow: true,
      },
    ]
  },
  {
    title: "Lesson 3: Chord Progressions",
    steps: [
      {
        title: "Welcome to Lesson 3!",
        text: "(Slight) music theory break! Here you'll learn about chords and arpeggios, and how they can help you create songs.",
        target: "none",
        hasArrow: false
      },
      {
        title: "What is a chord and arpeggio?",
        text: "A chord is a group of notes played together that usually sound nice harmonically. An arpeggio is like a broken up chord, played sequentially, one note at a time.",
        target: "none",
        hasArrow: false
      },
      {
        title: "What is a chord progression?",
        text: "There's a lot more you can learn about chords and music theory, but a chord progression is a series of chords played in succession, which kind of shape the vibes of a song.",
        target: "none",
        hasArrow: false
      },
      {
        title: "Progressions are very reused",
        text: "You can definitely get creative and experiment with your progressions, but a most songs, particularly in pop, all reuse the same couple of chord progressions.",
        target: "none",
        hasArrow: false
      },
      {
        title: "Common Pop and Jazz Progressions",
        text: "Here, we present some of the common chord progressions found in pop and jazz songs. The roman numerals represent what chords are being played, but if you don't understand them, just give them a listen and see what you like.",
        target: "none",
        hasArrow: false
      },
      {
        title: "Play with the arpeggiator",
        text: "Select a progression, and select whether you'd like to hear the notes individually (as an arpeggio), or together (as a chord). Then click play to listen and jam along! You can change the key and tempo as well if you wish, but vibes are most heavily influenced by the progression :)",
        target: "none",
        hasArrow: false
      },
    ]
  },
];

export default lessons;
