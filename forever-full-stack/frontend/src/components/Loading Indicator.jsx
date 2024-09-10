import React from "react";
import Loader from "./Loader";
const LoadingIndicator = () => {
  return (
    <div
      style={{
        position: "fixed",
        display: "block",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        opacity: 0.7,
        backgroundColor: "white",
        zIndex: 99,
      }}
    >
      <Loader />
    </div>
  );
};

export default LoadingIndicator;
