import { Piano, Music, Headphones } from 'lucide-react';

const levels = [
  {
    id: 'level1',
    title: 'Basics',
    description: 'Start with the DAW basics',
    lessons: [
      {
        id: 'intro-daw',
        name: 'Intro to the DAW',
        color: 'bg-blue-500',
        icon: <Music />
      }
    ]
  },
  {
    id: 'level2',
    title: 'Instruments',
    description: 'Choose and use virtual instruments',
    lessons: [
      {
        id: 'piano',
        name: 'Piano',
        color: 'bg-green-500',
        icon: <Piano />
      },
      // {
      //   id: 'arp',
      //   name: 'Arpeggiator',
      //   color: 'bg-green-500',
      //   icon: <Piano />
      // }
    ]
  },
  {
    id: 'level3',
    title: 'Mixing Tools',
    description: 'Learn about audio effects',
    lessons: [
      {
        id: 'controls',
        name: 'Controls',
        color: 'bg-red-500',
        icon: <Headphones />
      }
    ]
  }
];

export default levels;
