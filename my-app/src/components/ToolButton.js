import React from 'react';
import './ToolButton.css';

const ToolButton = ({ 
  children, 
  bgColor, 
  className = '', 
  size = 'md',
  onClick,
  disabled = false 
}) => {
  const baseClass =
    size === 'md' ? 'tool-button' : 'tool-button-sm';
  const disabledClass =
    disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105';

  return (
    <button 
      className={`${baseClass} ${disabledClass} ${className}`}
      style={{ backgroundColor: bgColor }} 
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default ToolButton;
