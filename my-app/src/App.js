import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './Home';
import Playground from "./Playground";
import Lesson1 from "./Lesson1";
import Lesson2 from "./Lesson2";
import { getUnlockedFeatures } from './featureUnlocks';

function App() {
  const highestLessonCompleted = parseInt(localStorage.getItem("highestLessonCompleted") || "0");
  const featureLocks = getUnlockedFeatures(highestLessonCompleted);

  const unlockFeature = (featureKey) => {
    const updated = { ...featureLocks, [featureKey]: false };
    localStorage.setItem("featureLocks", JSON.stringify(updated));
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route
          path="/lesson1"
          element={
            <Lesson1 unlockFeature={unlockFeature} featureLocks={featureLocks} />
          }
        />
        <Route
          path="/lesson2"
          element={
            <Lesson2 unlockFeature={unlockFeature} featureLocks={featureLocks} />
          }
        />
        <Route
          path="/playground"
          element={<Playground featureLocks={featureLocks} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
