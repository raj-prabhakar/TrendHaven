import React, { useState, useEffect } from "react";

const Loader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress === 100) {
          return 0;
        }

        return prevProgress + 1;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const strokeDasharray = `${progress} ${100 - progress}`;

  return (
    <div
      style={{
        height: 200,
        width: 200,
        position: "absolute",
        alignSelf: "center",
        right: "inherit",
        left: "inherit",
        top: "inherit",
        bottom: "inherit",
        justifySelf: "center",
        zIndex: 100,
      }}
    >
      <svg viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#ccc"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          stroke="#000"
          strokeWidth="10"
          fill="#A1A1A1"
          strokeDasharray={strokeDasharray}
        />
      </svg>
    </div>
  );
};

export default Loader;
