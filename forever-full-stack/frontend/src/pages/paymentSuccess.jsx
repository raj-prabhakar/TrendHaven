import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";

const PaymentSuccess = () => {
  const searchQuery = useSearchParams()[0];
  const referenceNum = searchQuery.get("reference");
  const [t, setT] = useState(5); // initial countdown time
  const navigate = useNavigate();

  const [orderData, setOrderData] = useState(null);

  const { setCartItems, token, backendUrl, generateInvoicePDF } =
    useContext(ShopContext);

  const handlePayment = async () => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/place",
        orderData,
        { headers: { token } }
      );
      if (response.data.success) {
        setCartItems({});
        await generateInvoicePDF(orderData); // Generate and send PDF invoice
        toast.success("Order Placed Successfully");
        startCountdown(); // Start the countdown timer after payment success
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Payment failed. Please try again.");
    }
  };

  const startCountdown = () => {
    const intervalId = setInterval(() => {
      setT((prevT) => {
        if (prevT === 1) {
          clearInterval(intervalId);
          navigate("/orders");
        }
        return prevT - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    let storedOrderData = localStorage.getItem("order_Data");
    storedOrderData = JSON.parse(storedOrderData);
    setOrderData(storedOrderData);
  }, []);

  useEffect(() => {
    if (token && orderData) {
      console.log(orderData, "order here");
      handlePayment();
    }
  }, [orderData]);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <h1
        style={{
          textTransform: "uppercase",
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: "1rem",
        }}
      >
        Order Successful
      </h1>
      <p style={{ fontSize: "1.2rem", color: "#555", marginBottom: "1rem" }}>
        Reference No. {referenceNum}
      </p>
      <p style={{ fontSize: "1rem", color: "#777", marginBottom: "1rem" }}>
        You will be redirected to the order screen in {t} seconds
      </p>
      <div
        style={{
          width: "100%",
          maxWidth: "300px",
          height: "8px",
          background: "#ddd",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${(t / 5) * 100}%`,
            height: "100%",
            background: "#4CAF50",
            transition: "width 1s linear",
          }}
        />
      </div>
    </div>
  );
};

export default PaymentSuccess;
