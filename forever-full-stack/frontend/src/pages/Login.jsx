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

  const onSuccess = async (response) => {
    try {
      const googleToken = response.credential; // Google OAuth token

      // Send the token to your backend
      const backendResponse = await axios.post(
        `${backendUrl}/api/user/google-login`,
        {
          token: googleToken,
        }
      );

      if (backendResponse.data.success) {
        setToken(backendResponse.data.token);
        localStorage.setItem("token", backendResponse.data.token); // Store your app JWT token
        localStorage.setItem("userId", backendResponse.data.id);
        toast.success("Google login successful!");
        navigate("/");
      } else {
        toast.error(backendResponse.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message || "Failed to authenticate with Google");
      console.error(error);
    }
  };

  const onFailure = (error) => {
    toast.error("Google Login Failed");
    console.error(error);
  };

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
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle Google sign-in
  const handleGoogleSignIn = () => {
    // Add the logic to handle Google sign-in here
    toast.info("Google sign-in not yet implemented");
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="flex flex-row md:flex-row items-center justify-between h-screen w-[100%] ">
          {/* Left Section (Image) */}
          <div className="flex-1 hidden md:flex justify-center items-center h-full">
            <img
              src={loginPageImage} // Ensure this is the correct path to your image
              alt="Fashion Image"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Divider */}
          <div className="hidden md:flex h-full border-l border-gray-400 mx-10"></div>

          {/* Right Section (Form) */}
          <div className="flex-1 flex justify-center flex-col">
            <form
              onSubmit={onSubmitHandler}
              className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto gap-4 text-gray-800 mr-10 mb-28"
            >
              <div className="inline-flex items-center gap-2 mb-2 mt-10">
                <p className="prata-regular text-3xl">{currentState}</p>
                <hr className="border-none h-[1.5px] w-8 bg-gray-800" />
              </div>
              {currentState === "Sign Up" && (
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-800"
                  placeholder="Name"
                  required
                  disabled={loading}
                />
              )}
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                type="email"
                className="w-full px-3 py-2 border border-gray-800"
                placeholder="Email"
                required
                disabled={loading}
              />
              {(!otpField || currentState === "Enter new password") && (
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                  type="password"
                  className="w-full px-3 py-2 border border-gray-800"
                  placeholder={
                    currentState === "Enter new password"
                      ? currentState
                      : "Enter Password"
                  }
                  required
                  disabled={loading}
                />
              )}
              {(currentState === "Sign Up" ||
                currentState === "Enter new password") && (
                <input
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  value={confirmPassword}
                  type="password"
                  className="w-full px-3 py-2 border border-gray-800"
                  placeholder="Confirm Password"
                  required
                  disabled={loading}
                />
              )}
              {currentState === "Reset Password" && (
                <input
                  onChange={(e) => setOtp(e.target.value)}
                  value={otp}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-800"
                  placeholder="Enter OTP"
                  required
                  disabled={loading}
                />
              )}
              <div className="w-full flex justify-between text-sm mt-[-8px]">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                >
                  <p className="cursor-pointer">Forgot your password?</p>
                </button>
                {currentState === "Login" ? (
                  <p
                    onClick={() => setCurrentState("Sign Up")}
                    className="cursor-pointer"
                  >
                    Create account
                  </p>
                ) : (
                  <p
                    onClick={() => setCurrentState("Login")}
                    className="cursor-pointer"
                  >
                    Login Here
                  </p>
                )}
              </div>
              <button
                // className="bg-black text-white font-light px-8 py-2 mt-4"
                className="w-full bg-black text-white px-3 py-2 font-light mt-2"
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
              {/* <button
                type="button"
                className="w-full border border-gray-800 px-3 mt-4 flex items-center justify-center gap-1"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <div className="flex flex-row items-center mt-2">
                  <img
                    src="https://t4.ftcdn.net/jpg/03/08/54/37/360_F_308543787_DmPo1IELtKY9hG8E8GlW8KHEsRC7JiDN.jpg"
                    alt="Google"
                    className="w-11 h-11 mb-1" // Adjust size as needed
                  />
                  <p className="prata-regular mb-1">Sign in with Google</p>
                </div>
              </button> */}
              <div className="w-full px-3 mt-6 flex items-center justify-center gap-1">
                <GoogleLogin onSuccess={onSuccess} onError={onFailure} />
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
