import React, { useState, useEffect } from 'react';
import './index.css'; 
import { useNavigate } from 'react-router-dom';
import LevelDescrip from './LevelDescrip'
import ToolButton from './components/ToolButton'
import levels from './Levels'
import './Home.css';
import './components/ToolButton.css'
import { ReactComponent as Playground } from './assets/Playground.svg';

  const Home = () => {
  const navigate = useNavigate();

  const [userProgress, setUserProgress] = useState({
    track: true,
    volume: true,
  });

  const [showAchievement, setShowAchievement] = useState(null);

  useEffect(() => {
    const achievementParam = new URLSearchParams(window.location.search).get('achievement');
    if (achievementParam) {
      setShowAchievement(achievementParam);

      // Update user progress
      setUserProgress((prev) => ({
        ...prev,
        [achievementParam]: true,
      }));

      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // const handleToolClick = (toolId) => {
  //   if (userProgress[toolId]) {
  //     navigate(`/playground?tool=${toolId}`);
  //   } else {
  //     navigate(`/lesson/${toolId}`);
  //   }
  // };

  const navigateToPlayground = () => {
    navigate('/playground');
  };

  const navigateToLesson = () => {
    navigate('/lesson2');
  };

  const getAchievementDetails = () => {
    switch (showAchievement) {
      case 'compressor':
        return {
          title: 'Congratulations!',
          description: "You've successfully unlocked COMPRESSOR",
        };
      case 'eq':
        return {
          title: 'Well Done!',
          description: "You've mastered and unlocked EQUALIZER",
        };
      default:
        return {
          title: 'Achievement Unlocked!',
          description: "You've learned a new skill",
        };
    }
  };

  return (
    <div className="min-h-screen dawlingo-light-pink">
      {/* Header with logo and playground button */}
      <header className="dawlingo-pink py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white">DAWlingo</h1>
        </div>
        <playground-button 
          onClick={navigateToPlayground}
          className="bg-dawlingo-light-pink rounded-full p-2 hover:bg-opacity-80 transition-all"
          aria-label="Go to playground"
        >
          <Playground width={80} height={80} fill="white" />
        </playground-button>
      </header>
        
      {/* Main content */}
      <main className="container max-w-3xl mx-auto py-8 px-4">
        {/* Levels */}
        <div className="space-y-8">
          {levels.map((level) => (
            <div key={level.id} className="space-y-4">
              <LevelDescrip 
                title={level.title}
                description={level.description}
              />
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pl-4">
                {level.lessons.map((tool) => {
                  const isUnlocked = userProgress[tool.id] || false;
                  return (
                    <div key={tool.id} className="flex flex-col items-center gap-2">
                      <ToolButton
                        // onClick={() => handleToolClick(tool.id)}
                        onClick={navigateToLesson}
                        className={isUnlocked ? "" : "opacity-70"}
                        >
                        {tool.icon}
                      </ToolButton>
                    
                      <span className="text-xs font-medium">
                        {tool.name}
                        {/* TODO: add lock here!!!! */}
                        {!isUnlocked} 
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        </div>
      </main>
    </div>
  );
};

export default Home;
