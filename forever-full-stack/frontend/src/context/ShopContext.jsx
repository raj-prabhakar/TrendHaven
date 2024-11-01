import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = "$";
  const delivery_fee = 10;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState("");
  const [order_Data, set_OrderData] = useState({
    address: "",
    items: [],
    amount: 0,
  });
  const navigate = useNavigate();

  function calculateTotalPrice(products) {
    return products.reduce((total, product) => {
      return total + product.price * product.quantity;
    }, 0);
  }

  const generateInvoicePDF = async (orderData) => {
    const { items, address } = orderData;
    const userName = `${address.firstName} ${address.lastName}`;
    const fullAddress = `${address.street}, ${address.city}, ${address.state} - ${address.zipcode}, ${address.country}`;
    const email = address.email;

    const doc = new jsPDF();

    // Set company information
    doc.setFontSize(22);
    doc.text("Forever", 20, 20);
    doc.setFontSize(12);
    doc.text(
      `Ground Floor, Tower A, TechPark Business Center, Electronic City Phase 1, 
  Hosur Road, Bengaluru, Karnataka - 560100, India`,
      20,
      30
    );

    // Set customer information
    doc.text(`Invoice To:`, 20, 50);
    doc.text(`Name: ${userName}`, 20, 60);
    doc.text(`Email: ${email}`, 20, 70);

    // Split the address if it’s too long to fit in one line
    const addressLines = doc.splitTextToSize(`Address: ${fullAddress}`, 170);
    addressLines.forEach((line, index) => {
      doc.text(line, 20, 80 + index * 10);
    });

    // Add a line break before the table
    const addressEndY = 80 + addressLines.length * 10;
    doc.setLineWidth(0.5);
    doc.line(20, addressEndY + 10, 190, addressEndY + 10);

    // Prepare table with item data
    const tableColumn = ["Description", "Quantity", "Price"];
    const tableRows = [];

    items.forEach((item) => {
      const itemData = [
        item.name,
        item.quantity.toString(),
        `$${item.price.toFixed(2)}`,
      ];
      tableRows.push(itemData);
    });

    // Adding table using autoTable
    doc.autoTable({
      startY: addressEndY + 20,
      head: [tableColumn],
      body: tableRows,
    });

    // Calculate total amount with delivery fee
    const totalAmount = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    const totalPrice = totalAmount + delivery_fee;

    // Add delivery fee and total at the bottom
    doc.text(
      `Delivery Fee: $${delivery_fee.toFixed(2)}`,
      160,
      doc.lastAutoTable.finalY + 10
    );
    doc.text(
      `Total: $${totalPrice.toFixed(2)}`,
      160,
      doc.lastAutoTable.finalY + 20
    );

    // Save the PDF to blob
    const pdfBlob = doc.output("blob");

    // Send the PDF to the backend
    const formData = new FormData();
    formData.append("file", pdfBlob, "invoice.pdf");
    formData.append("email", email); // Attach user's email if necessary

    try {
      await axios.post(`${backendUrl}/api/order/send-invoice`, formData, {
        headers: { "Content-Type": "multipart/form-data", token },
      });
      toast.success("PDF sent successfully to email");
    } catch (error) {
      console.error("Error sending PDF to email:", error);
      toast.error("Error sending PDF to email");
    }
  };

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Select Product Size");
      return;
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }
    setCartItems(cartData);

    if (token) {
      try {
        const response = await axios.post(
          backendUrl + "/api/cart/add",
          { itemId, size },
          { headers: { token } }
        );
        // Success message based on backend response
        if (response.data && response.data.message) {
          toast.success(response.data.message); // Show success toast with backend message
        } else {
          toast.success("Item successfully added to the cart!"); // Default success message
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {}
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems);

    cartData[itemId][size] = quantity;

    setCartItems(cartData);

    if (token) {
      try {
        const response = await axios.post(
          backendUrl + "/api/cart/update",
          { itemId, size, quantity },
          { headers: { token } }
        );
        if (response && quantity == 0) {
          toast.success("Item removed from Cart");
        }
      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) {}
      }
    }
    return totalAmount;
  };

  const getProductsData = async () => {
    try {
      const response = await axios.get(backendUrl + "/api/product/list");
      if (response.data.success) {
        setProducts(response.data.products.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getUserCart = async (token) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/cart/get",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    getProductsData();
  }, []);

  useEffect(() => {
    if (!token && localStorage.getItem("token")) {
      setToken(localStorage.getItem("token"));
      getUserCart(localStorage.getItem("token"));
    }
    if (token) {
      getUserCart(token);
    }
  }, [token]);

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    setCartItems,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    backendUrl,
    setToken,
    order_Data,
    set_OrderData,
    token,
    generateInvoicePDF,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
