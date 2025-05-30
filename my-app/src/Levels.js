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
      },
      {
        id: 'instruments',
        name: 'Instruments',
        color: 'bg-green-500',
        icon: <Piano />
      }
    ]
  },
  {
    id: 'level2',
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
