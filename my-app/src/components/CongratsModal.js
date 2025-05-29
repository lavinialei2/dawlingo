import React from "react";
import "./CongratsModal.css";

const CongratsModal = ({ image, onClose, onReturnHome }) => {
  return (
    <div className="congrats-overlay">
      <div className="congrats-modal">
        <button className="close-button" onClick={onClose}>×</button>

        {image && (
          <div className="image-wrapper">
            <img src={image} alt="Congratulations" className="congrats-image" />
            <button className="return-home-button" onClick={onReturnHome}>
              Return Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CongratsModal;
