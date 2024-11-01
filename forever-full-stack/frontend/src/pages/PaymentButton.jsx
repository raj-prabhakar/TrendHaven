import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const PaymentComponent = () => {
  const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

  const location = useLocation();
  const { amount } = location.state || {}; // Accessing the prop

  const [userData, setUserData] = useState(null);

  const userId = localStorage.getItem("userId");

  const handleUserData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/user-data/${userId}`
      );
      setUserData(response.data.user);
    } catch (error) {
      console.log(error);
    }
  };

  const checkoutHandler = async () => {
    try {
      const {
        data: { order },
      } = await axios.post("http://localhost:4000/api/razorpay/checkout", {
        amount: amount, // replace with actual amount in paise if needed
      });

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Forever",
        description: "Test Transaction",
        order_id: order.id,
        callback_url: "http://localhost:4000/api/razorpay/paymentverification",
        prefill: {
          name: userData?.name || "John Doe",
          email: userData?.email || "john.doe@example.com",
          contact: "9756113474",
        },
        theme: {
          color: "#211e20",
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("Error opening Razorpay checkout:", error);
      navigate("/place-order");
    }
  };

  useEffect(() => {
    handleUserData();
  }, []);

  useEffect(() => {
    checkoutHandler(); // Automatically trigger payment on component mount
  }, [userData])

  return (
    <></>
    // <div>
    //   <h1>Payment Page</h1>
    //   <p>If the payment window does not open, please refresh or try again.</p>
    // </div>
  );
};

export default PaymentComponent;
