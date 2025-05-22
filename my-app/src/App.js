// core state & routing framework for locking/unlocking features
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from './Home';
import Playground from "./Playground";
import Lesson1 from "./Lesson1";
import Lesson2 from "./Lesson2";

function App() {
  // Global progress state
  const [featureLocks, setFeatureLocks] = useState({
    compressor: true, // true means locked
    reverb: true,
    eq: true,
  });


  // Function to unlock features (e.g., called when a lesson is completed)
  const unlockFeature = (featureKey) => {
    setFeatureLocks((prev) => ({ ...prev, [featureKey]: false }));
  };

  return (
    <Router>
      {/* <nav style={{ padding: "1rem", background: "#222", color: "white" }}>
        <Link to="/lesson1" style={{ marginRight: "1rem", color: "#61dafb" }}>Lesson 1</Link>
        <Link to="/lesson2" style={{ marginRight: "1rem", color: "#61dafb" }}>Lesson 2</Link>
        <Link to="/playground" style={{ color: "#61dafb" }}>Playground</Link>
      </nav> */}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route
          path="/lesson1"
          element={<Lesson1 unlockFeature={unlockFeature} featureLocks={featureLocks} />}
        />
        <Route
          path="/lesson2"
          element={<Lesson2 unlockFeature={unlockFeature} featureLocks={featureLocks} />}
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
