// featureUnlocks.js

export const getUnlockedFeatures = (highestLessonCompleted) => {
    const defaultLocks = {
      compressor: true,
      reverb: true,
      eq: true,
      piano: true,
      arp: true,
    };
  
    const unlockMap = [
      [],
      [],
      ['piano'],
      ['piano', 'arp'],
      ['piano', 'compressor', 'eq', 'reverb'],
    ];
  
    const unlocked = unlockMap[Math.min(highestLessonCompleted, unlockMap.length - 1)];
  
    const result = { ...defaultLocks };
    unlocked.forEach((feature) => {
      result[feature] = false;
    });
  
    return result;
  };
  