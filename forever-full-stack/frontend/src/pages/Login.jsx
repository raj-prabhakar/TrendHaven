import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import loginPageImage from "../assets/login_page_image.jpg"; // Ensure the correct path and extension
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate, backendUrl, userId, setUserId } =
    useContext(ShopContext);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpField, setOtpField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  // Handle Google login success
  const onSuccess = async (response) => {
    try {
      const googleToken = response.credential;

      const backendResponse = await axios.post(
        `${backendUrl}/api/user/google-login`,
        { token: googleToken }
      );

      if (backendResponse.data.success) {
        setToken(backendResponse.data.token);
        localStorage.setItem("token", backendResponse.data.token);
        localStorage.setItem("userId", backendResponse.data.id);
        toast.success("Google login successful!");
        navigate("/");
      } else {
        toast.error(backendResponse.data.message);
      }
    } catch (error) {
      toast.error(
        error.response.data.message || "Failed to authenticate with Google"
      );
      console.error(error);
    }
  };

  // Handle form submit
  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (
      (currentState === "Sign Up" || currentState === "Enter new password") &&
      confirmPassword !== password
    ) {
      toast.error("The passwords don't match");
      return;
    }
    setLoading(true);
    try {
      if (currentState === "Sign Up") {
        const response = await axios.post(`${backendUrl}/api/user/register`, {
          name,
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("userId", response.data.id);
          navigate("/");
        } else {
          toast.error(response.data.message);
        }
      } else if (currentState === "Login") {
        const response = await axios.post(`${backendUrl}/api/user/login`, {
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("userId", response.data.id);
          navigate("/");
        } else {
          toast.error(response.data.message);
        }
      } else if (currentState === "Reset Password") {
        const response = await axios.post(
          `${backendUrl}/api/user/verify-pass-otp`,
          { email, otp }
        );
        if (response.data.success) {
          toast.success("OTP Verified");
          setCurrentState("Enter new password");
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(
          `${backendUrl}/api/user/set-new-pass`,
          { email, password }
        );
        if (response.data.success) {
          toast.success("Password reset successful");
          setCurrentState("Login");
          setToken(response.data.token);
          localStorage.setItem("token", response.data.token);
          navigate("/");
        } else {
          toast.error(response.data.message);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/");
    }
  }, [token, navigate]);

  // Handle OTP send
  const handleSendOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/forgot-pass-otp`,
        { email }
      );
      if (response.data.success) {
        toast.success("Password reset OTP sent to your email");
        setOtpField(true);
        setCurrentState("Reset Password");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="flex flex-col md:flex-row items-center justify-between h-screen w-full bg-gray-100">
          {/* Left Section with Image */}
          <div className="hidden md:flex flex-1 h-full">
            <img
              src={loginPageImage}
              alt="Fashion"
              className="w-full h-full object-cover shadow-xl"
            />
          </div>

          {/* Form Section */}
          <div className="flex-1 flex justify-center items-center bg-white shadow-lg p-8">
            <form
              onSubmit={onSubmitHandler}
              className="flex flex-col items-center w-full max-w-sm gap-6"
            >
              <h2 className="text-3xl font-semibold text-gray-700">
                {currentState}
              </h2>

              {currentState === "Sign Up" && (
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  type="text"
                  placeholder="Name"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  disabled={loading}
                />
              )}

              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                placeholder="Email"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
                disabled={loading}
              />

              {(!otpField || currentState === "Enter new password") && (
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  type="password"
                  placeholder={
                    currentState === "Enter new password"
                      ? currentState
                      : "Password"
                  }
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  disabled={loading}
                />
              )}

              {currentState === "Sign Up" ||
              currentState === "Enter new password" ? (
                <input
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  value={confirmPassword}
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  disabled={loading}
                />
              ) : null}

              {currentState === "Reset Password" && (
                <input
                  onChange={(e) => setOtp(e.target.value)}
                  value={otp}
                  type="text"
                  placeholder="Enter OTP"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                  disabled={loading}
                />
              )}

              <div className="flex justify-between w-full text-sm">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  <span className="text-indigo-600 hover:underline">
                    Forgot password?
                  </span>
                </button>

                {currentState === "Login" ? (
                  <p
                    onClick={() => setCurrentState("Sign Up")}
                    className="text-indigo-600 hover:underline cursor-pointer"
                  >
                    Create account
                  </p>
                ) : (
                  <p
                    onClick={() => setCurrentState("Login")}
                    className="text-indigo-600 hover:underline cursor-pointer"
                  >
                    Login here
                  </p>
                )}
              </div>

              <button
                className="w-full p-3 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {loading
                  ? "Loading..."
                  : currentState === "Login"
                  ? "Sign In"
                  : currentState === "Reset Password"
                  ? "Verify OTP"
                  : currentState === "Enter new password"
                  ? "Set New Password"
                  : "Sign Up"}
              </button>

              {/* Google Login */}
              <div className="w-full mt-4">
                <GoogleLogin
                  onSuccess={onSuccess}
                  onError={() => toast.error("Google login failed")}
                />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
