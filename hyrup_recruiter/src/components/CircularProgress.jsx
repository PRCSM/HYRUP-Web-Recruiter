import React from "react";

const CircularProgress = ({ percentage = 50 }) => {
  const size = 100; // width & height
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  // Calculate knob (dot) position
  const angle = (percentage / 100) * 360 - 90; // start from top (-90°)
  const knobX = size / 2 + radius * Math.cos((angle * Math.PI) / 180);
  const knobY = size / 2 + radius * Math.sin((angle * Math.PI) / 180);

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="#FFFFFF"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#6AB8FA"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>

      {/* Centered text */}
      <div className="absolute text-xl font-bold">
        {percentage}%
      </div>
    </div>
  );
};

export default CircularProgress;
