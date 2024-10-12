import React, { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";

const override = {
  display: "block",
  margin: "0 auto",
  borderColor: "black",
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [color, setColor] = useState("#ffffff");

  return (
    <div className="sweet-loading flex justify-center items-center min-h-screen">
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
