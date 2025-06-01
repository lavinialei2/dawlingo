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
import './ProgressButton.css';
import ProgressPopUp from "./components/ProgressPopUp";
import lesson0 from "./assets/0lesson.png";
import lesson1 from "./assets/1lesson.png";
import lesson2 from "./assets/2lesson.png";



const Home = () => {
  const navigate = useNavigate();
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [highestLessonCompleted, setHighestLessonCompleted] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const lessonPopUp = [lesson0, lesson1, lesson2]

  useEffect(() => {
    const stored = parseInt(localStorage.getItem("highestLessonCompleted") || "0");
    setHighestLessonCompleted(stored);
  }, []);

  const navigateToPlayground = () => {
    navigate('/playground');
  };

  const navigateToLesson = (lessonIndex) => {
    lessonIndex > 2 ? setShowUnavailable(true) : navigate(`/lesson${lessonIndex + 1}`);
  };


  return (

    <div className="min-h-screen dawlingo-light-pink">
      <header className="dawlingo-pink py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="pixel-font font-bold text-white">DAWlingo</h1>
        </div>
      </header>

      <div className="playground-button-bottom-left">
        <ToolButton
          onClick={() => navigateToPlayground()}
          style={{
            width: "120px",
            height: "120px"
          }}
        >
          <Playground width={90} height={90} fill="white" />
        </ToolButton>
        <span className="text-sm mt-1 font-semibold text-gray-800">Playground</span>
      </div>


      <div className="progress-button-bottom-right">
        <button className="progress-button" onClick={() => setShowProgress(true)}><b>Progress</b></button>
      </div>

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
                  const globalLessonIndex = levels.slice(0, levelIndex).reduce((sum, level) => sum + level.lessons.length, 0) + lessonIndex;
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

      {showProgress && (
        <ProgressPopUp
          image={lessonPopUp[highestLessonCompleted]}
          onClose={() => {
            setShowProgress(false);
          }}
        />
      )}
    </div>
  );
};

export default Home;
