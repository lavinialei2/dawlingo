import React from "react";
import "./ProgressPopUp.css";

const ProgressPopUp = ({image, onClose}) => {
  return (
    <div className="progress-overlay">
      <div className="progress-modal">
        <button className="close-button" onClick={onClose}>×</button>

        {image && (
          <div className="image-wrapper">
            <img src={image} alt="Progress" className="progress-image" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressPopUp;
