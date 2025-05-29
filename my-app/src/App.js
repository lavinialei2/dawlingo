import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from './Home';
import Playground from "./Playground";
import Lesson1 from "./Lesson1";
import Lesson2 from "./Lesson2";

function getInitialFeatureLocks() {
  try {
    const stored = localStorage.getItem("featureLocks");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading featureLocks from localStorage:", error);
  }

  return {
    compressor: true,
    reverb: true,
    eq: true,
    piano: true,
  };
}

function App() {
  const [featureLocks, setFeatureLocks] = useState(getInitialFeatureLocks);

  const unlockFeature = (featureKey) => {
    setFeatureLocks((prev) => {
      const updated = { ...prev, [featureKey]: false };
      localStorage.setItem("featureLocks", JSON.stringify(updated));
      return updated;
    });
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
