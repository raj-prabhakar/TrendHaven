import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import { assets } from "../assets/assets";
import Loader from "../components/Loader";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const [loading, setLoading] = useState(false);
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    setCartItems,
    getCartAmount,
    delivery_fee,
    products,
    generateInvoicePDF,
  } = useContext(ShopContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const isFormComplete = () => {
    return Object.values(formData).every((field) => field.trim() !== "");
  };

  const handleRazorPay = (orderData) => {
    localStorage.setItem("order_Data", JSON.stringify(orderData));
    navigate("/paymentbutton", { state: { amount: orderData.amount } });
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!isFormComplete()) {
      toast.error("Please fill all the required fields.");
      return;
    }

    setLoading(true);

    try {
      let orderItems = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(
              products.find((product) => product._id === items)
            );
            if (itemInfo) {
              itemInfo.size = item;
              itemInfo.quantity = cartItems[items][item];
              orderItems.push(itemInfo);
            }
          }
        }
      }

      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
      };

      if (!orderData.items || orderData.items.length === 0) {
        toast.error("Your cart is empty");
        return;
      }

      switch (method) {
        case "cod":
          const response = await axios.post(
            backendUrl + "/api/order/place",
            orderData,
            { headers: { token } }
          );
          if (response.data.success) {
            setCartItems({});
            await generateInvoicePDF(orderData); // Generate and send PDF invoice
            navigate("/orders");
            toast.success("Order Placed Successfully");
          } else {
            toast.error(response.data.message);
          }
          break;

        case "stripe":
          const responseStripe = await axios.post(
            backendUrl + "/api/order/stripe",
            orderData,
            { headers: { token } }
          );
          if (responseStripe.data.success) {
            const { session_url } = responseStripe.data;
            window.location.replace(session_url);
          } else {
            toast.error(responseStripe.data.message);
          }
          break;

        case "razorpay":
          handleRazorPay(orderData);
          break;

        default:
          break;
      }
    } catch (error) {
      console.error(error);
      toast.error("Order submission failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLocation = async () => {
    setLoading(true);
    try {
      if (navigator.geolocation) {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const lat = position.coords.latitude;
              const lng = position.coords.longitude;

              const VITE_GEOCODING_API_KEY = import.meta.env.VITE_GEOCODING_API_KEY;

              try {
                const response = await axios.get(
                  `https://geocode.maps.co/reverse?lat=${lat}&lon=${lng}&api_key=${VITE_GEOCODING_API_KEY}`
                );

                const address = response.data.address;
                setFormData((prevData) => ({
                  ...prevData,
                  street: address.road || "",
                  city: address.city || "",
                  state: address.state || "",
                  zipcode: address.postcode || "",
                  country: address.country || "",
                }));

                toast.success("Location and address fetched");
                resolve();
              } catch (error) {
                console.error("Error fetching address:", error);
                toast.error("Failed to fetch address");
                reject(error);
              }
            },
            () => {
              toast.error(
                "Geolocation failed. Please enable location services."
              );
              reject(new Error("Geolocation failed"));
            }
          );
        });
      } else {
        toast.error("Geolocation is not supported by your browser.");
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      toast.error("An unexpected error occurred while fetching the location.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <form
          onSubmit={onSubmitHandler}
          className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t"
        >
          {/* ------------- Left Side ---------------- */}
          <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
            <div className="text-xl sm:text-2xl my-3">
              <Title text1={"DELIVERY"} text2={"INFORMATION"} />
            </div>
            <div className="flex gap-3">
              <input
                required
                onChange={onChangeHandler}
                name="firstName"
                value={formData.firstName}
                className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                type="text"
                placeholder="First name"
              />
              <input
                required
                onChange={onChangeHandler}
                name="lastName"
                value={formData.lastName}
                className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                type="text"
                placeholder="Last name"
              />
            </div>
            <input
              required
              onChange={onChangeHandler}
              name="email"
              value={formData.email}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
              type="email"
              placeholder="Email address"
            />
            <input
              required
              onChange={onChangeHandler}
              name="street"
              value={formData.street}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
              type="text"
              placeholder="Street"
            />
            <div className="flex gap-3">
              <input
                required
                onChange={onChangeHandler}
                name="city"
                value={formData.city}
                className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                type="text"
                placeholder="City"
              />
              <input
                onChange={onChangeHandler}
                name="state"
                value={formData.state}
                className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                type="text"
                placeholder="State"
              />
            </div>
            <div className="flex gap-3">
              <input
                required
                onChange={onChangeHandler}
                name="zipcode"
                value={formData.zipcode}
                className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                type="number"
                placeholder="Zipcode"
              />
              <input
                required
                onChange={onChangeHandler}
                name="country"
                value={formData.country}
                className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
                type="text"
                placeholder="Country"
              />
            </div>
            <input
              required
              onChange={onChangeHandler}
              name="phone"
              value={formData.phone}
              className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
              type="number"
              placeholder="Phone"
            />
            <button type="button" style={buttonStyle} onClick={handleLocation}>
              Get Location
            </button>
          </div>

          {/* ------------- Right Side ------------------ */}
          <div className="mt-8">
            <div className="mt-8 min-w-80">
              <CartTotal />
            </div>

            <div className="mt-12">
              <Title text1={"PAYMENT"} text2={"METHOD"} />
              {/* --------------- Payment Method Selection ------------- */}
              <div className="flex gap-3 flex-col lg:flex-row">
                <div
                  onClick={() => setMethod("stripe")}
                  className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
                >
                  <p
                    className={`min-w-3.5 h-3.5 border rounded-full ${
                      method === "stripe" ? "bg-green-400" : ""
                    }`}
                  ></p>
                  <img className="h-5 mx-4" src={assets.stripe_logo} alt="" />
                </div>
                <div
                  onClick={() => setMethod("razorpay")}
                  className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
                >
                  <p
                    className={`min-w-3.5 h-3.5 border rounded-full ${
                      method === "razorpay" ? "bg-green-400" : ""
                    }`}
                  ></p>
                  <img className="h-5 mx-4" src={assets.razorpay_logo} alt="" />
                </div>
                <div
                  onClick={() => setMethod("cod")}
                  className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
                >
                  <p
                    className={`min-w-3.5 h-3.5 border rounded-full ${
                      method === "cod" ? "bg-green-400" : ""
                    }`}
                  ></p>
                  <p className="text-gray-500 text-sm font-medium mx-4">
                    CASH ON DELIVERY
                  </p>
                </div>
              </div>

              <div className="w-full text-end mt-8">
                <button
                  type="submit"
                  className="bg-black text-white px-16 py-3 text-sm"
                >
                  PLACE ORDER
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </>
  );
};

const buttonStyle = {
  backgroundColor: "#4CAF50", // Green color
  color: "white",
  padding: "10px 20px",
  fontSize: "16px",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  transition: "background-color 0.3s ease, transform 0.2s ease",
};

// Apply hover effect using CSS
buttonStyle[":hover"] = {
  backgroundColor: "#45a049",
  transform: "scale(1.05)", // Slightly enlarges the button on hover
};

export default PlaceOrder;
