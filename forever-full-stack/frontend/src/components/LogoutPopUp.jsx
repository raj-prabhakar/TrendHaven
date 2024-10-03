import React, { useContext } from "react";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";

const LogoutPopUp = ({ visiblePopUp, setVisiblePopUp }) => {
  const { navigate, setToken, setCartItems } = useContext(ShopContext);

  const handleLogout = () => {
    toast.success("User logged out successfully");
    setVisiblePopUp(false);
    navigate("/login");
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    setToken("");
    setCartItems({});
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-[90%] max-w-xs sm:max-w-sm mx-auto">
        <h2 className="text-lg sm:text-xl font-semibold text-center text-gray-800">
          Confirm Logout
        </h2>
        <p className="text-sm sm:text-base text-gray-600 text-center mt-2">
          Are you sure you want to log out of your account?
        </p>

        {/* Responsive flex direction and button width */}
        <div className="flex flex-col sm:flex-row justify-center mt-4 sm:mt-6 space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleLogout}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-red-500 text-white text-sm sm:text-base rounded-lg hover:bg-red-600 transition-colors w-3/4 sm:w-full mx-auto sm:mx-0"
          >
            Yes, Logout
          </button>
          <button
            onClick={() => setVisiblePopUp(false)}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-300 text-gray-700 text-sm sm:text-base rounded-lg hover:bg-gray-400 transition-colors w-3/4 sm:w-full mx-auto sm:mx-0"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutPopUp;
