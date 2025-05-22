import React from 'react';

const LevelDescrip = ({ 
  title, 
  description, 
  icon,
  className = '',
  onClick
}) => {
  return (
    <div 
      className={`lesson-card flex items-center justify-between cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-dawlingo-light-purple text-sm">{description}</p>
      </div>
      {icon && (
        <div className="ml-4">
          {icon}
        </div>
      )}
    </div>
  );
};

export default LevelDescrip;
