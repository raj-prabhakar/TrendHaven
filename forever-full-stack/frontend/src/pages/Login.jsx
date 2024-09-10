import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const [currentState, setCurrentState] = useState("Login");
  const { token, setToken, navigate, backendUrl, userId, setUserId } = useContext(ShopContext);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpField, setOtpField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

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
        const response = await axios.post(backendUrl + "/api/user/register", {
          name,
          email,
          password,
        });
        if (response.data.success) {
          setToken(response.data.token);
          console.log(userId, "userrrrr idd");
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("userId", response.data.id);
          navigate("/");
        } else {
          toast.error(response.data.message);
        }
      } else if (currentState === "Login") {
        const response = await axios.post(backendUrl + "/api/user/login", {
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
          backendUrl + "/api/user/verify-pass-otp",
          {
            email,
            otp,
          }
        );
        if (response.data.success) {
          toast.success("OTP Verified");
          setCurrentState("Enter new password");
        } else {
          toast.error(response.data.message);
        }
      } else {
        const response = await axios.post(
          backendUrl + "/api/user/set-new-pass",
          {
            email,
            password,
          }
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
        backendUrl + "/api/user/forgot-pass-otp",
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

  return (
    <>
      {loading ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(0.5px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <h1 style={{ fontSize: "2.5rem", color: "#333" }}>Loading....</h1>
        </div>
      ) : (
        <div>
          <form
            onSubmit={onSubmitHandler}
            className="flex flex-col items-center w-[90%] sm:max-w-96 m-auto mt-14 gap-4 text-gray-800"
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
              <button type="button" onClick={handleSendOtp} disabled={loading}>
                <p className="cursor-pointer">Forgot your password?</p>
              </button>
              {currentState === "Login" ? (
                <p
                  onClick={() => setCurrentState("Sign Up")}
                  className="cursor-pointer"
                  disabled={loading}
                >
                  Create account
                </p>
              ) : (
                <p
                  onClick={() => setCurrentState("Login")}
                  className="cursor-pointer"
                  disabled={loading}
                >
                  Login Here
                </p>
              )}
            </div>
            <button
              className="bg-black text-white font-light px-8 py-2 mt-4"
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
          </form>
        </div>
      )}
    </>
  );
};

export default Login;
