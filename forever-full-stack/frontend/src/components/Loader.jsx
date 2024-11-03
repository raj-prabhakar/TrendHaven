import React, { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";

const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "black",
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [color, setColor] = useState("#000000"); // Use black color for better visibility

  return (
    <div className="relative flex justify-center items-center min-h-screen">
      <div
        className="absolute inset-0 bg-white opacity-75"
        style={{ zIndex: -1 }}
      ></div>
      <ClipLoader
        color={color}
        loading={loading}
        cssOverride={override}
        size={150}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
};

export default App;
