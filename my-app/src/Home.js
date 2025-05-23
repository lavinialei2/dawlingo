import React, { useState, useEffect } from 'react';
import './index.css'; 
import { useNavigate } from 'react-router-dom';
import LevelDescrip from './LevelDescrip'
import ToolButton from './components/ToolButton'
import levels from './Levels'
import './Home.css';
import './components/ToolButton.css'
import UnavailableLessonModal from "./components/UnavailableLessonModal";
import unavailableLesson from "./assets/unavailable.png";
import { ReactComponent as Playground } from './assets/Playground.svg';


const Home = () => {
  const navigate = useNavigate();
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [showPlaygroundIntro, setShowPlaygroundIntro] = useState(false);
  const [highestLessonCompleted, setHighestLessonCompleted] = useState(0);

  useEffect(() => {
    const stored = parseInt(localStorage.getItem("highestLessonCompleted") || "0");
    setHighestLessonCompleted(stored);
  }, []);

  const navigateToPlayground = () => {
    localStorage.setItem("showPlaygroundIntro", "true");
    navigate('/playground');
  };

  const navigateToLesson = (lessonIndex) => {
    // temp logic: only allow to click on first lesson !!
    lessonIndex > 0 ? setShowUnavailable(true) : navigate(`/lesson${lessonIndex + 1}`);
  };

  return (
    <div className="min-h-screen dawlingo-light-pink">
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
        
      <main className="container max-w-3xl mx-auto py-8 px-4">
        <div className="space-y-8">
          {levels.map((level, levelIndex) => (
            <div key={level.id} className="space-y-4">
              <LevelDescrip 
                title={level.title}
                description={level.description}
              />
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pl-4">
                {level.lessons.map((tool, lessonIndex) => {
                  const globalLessonIndex = levelIndex === 0 ? lessonIndex : levels[0].lessons.length + lessonIndex;
                  const isUnlocked = globalLessonIndex <= highestLessonCompleted;

                  return (
                    <div key={tool.id} className="flex flex-col items-center gap-2">
                      <ToolButton
                        onClick={() => navigateToLesson(globalLessonIndex)}
                        className={isUnlocked ? "" : "opacity-70 cursor-not-allowed"}
                        disabled={!isUnlocked}
                      >
                        {tool.icon}
                      </ToolButton>
                      <span className="text-xs font-medium">
                        {tool.name} {isUnlocked ? "" : "🔒"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </main>
            {showUnavailable && (
        <UnavailableLessonModal
          image={unavailableLesson}
          onClose={() => {
            setShowUnavailable(false);
          }}
        />
      )}
    </div>
  );
};

export default Home;
