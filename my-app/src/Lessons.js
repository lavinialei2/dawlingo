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
        text: "Click the 'Add Track' button to create a new track. The selected track will be outlined in blue.",
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
        text: "Press 'Pause' to stop playing as well.",
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
        text: "You can also use the slider to adjust the playhead to where you want it.",
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
    title: "Lesson 2: Instruments",
    steps: [
      {
        title: "Welcome to Lesson 2!",
        text: "In this lesson, you'll learn how to add tracks and choose different instruments.",
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
];

export default lessons;
