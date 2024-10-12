import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import axios from "axios";
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);

  const [orderData, setorderData] = useState([]);
  const [userEmail, setUserEmail] = useState("");

  const [invoiceData, setInvoiceData] = useState({
    company: "Forever",
    address:
      `Ground Floor, Tower A, TechPark Business Center Electronic City Phase 1, 
    Hosur Road Bengaluru, Karnataka - 560100 India`,
    customer: {
      name: "John Doe",
      email: "johndoe@example.com",
      address: "456 Customer St, City, Country",
    },
    items: [
      //   { description: 'Product 1', quantity: 2, price: 50 },
      //   { description: 'Product 2', quantity: 1, price: 150 },
      //   { description: 'Product 3', quantity: 5, price: 20 },
    ],
    total: 0,
  });

  const InvoiceGenerator = (newItem) => {
    console.log(newItem, "current item here")
    const updatedItems = [
      ...invoiceData.items,
      {
        description: "Women Jacket",
        quantity: newItem.quantity,
        price: newItem.price,
      },
    ];

    const updatedTotal = updatedItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    setInvoiceData((prevData) => ({
      ...prevData,
      customer: {
        ...prevData.customer,
        name: newItem.name,
        email: userEmail,
        address: newItem.address,
      },
      items: updatedItems,
      total: updatedTotal,
    }));
  };

  const generateInvoicePDF = (item) => {
    InvoiceGenerator(item);
    const doc = new jsPDF();

    // Set company information
    doc.setFontSize(22);
    doc.text(invoiceData.company, 20, 20);
    doc.setFontSize(12);
    doc.text(invoiceData.address, 20, 30);

    // Set customer information
    doc.text(`Invoice To:`, 20, 50);
    doc.text(`Name: ${item.name}`, 20, 60);
    doc.text(`Email: ${userEmail}`, 20, 70);
    doc.text(`Address: ${item.address}`, 20, 80);

    // Add a line break before table
    doc.setLineWidth(0.5);
    doc.line(20, 90, 190, 90);

    // Prepare table with item data
    const tableColumn = ["Description", "Quantity", "Price"];
    const tableRows = [];

    const itemData = [
      // item.description,
      "Women Jacket",
      item.quantity.toString(),
      `$${item.price.toFixed(2)}`,
    ];
    tableRows.push(itemData);

    // Adding table using autoTable
    doc.autoTable({
      startY: 100,
      head: [tableColumn],
      body: tableRows,
    });

    // Add total at the bottom
    doc.text(
      `Total: $${item.price.toFixed(2)}`,
      160,
      doc.lastAutoTable.finalY + 20
    );

    // Save the PDF
    doc.save("invoice.pdf");
  };

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null;
      }

      const response = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        console.log(response.data, "orders here");
        setUserEmail(response.data.email);
        let allOrdersItem = [];
        response.data.orders.map((order) => {
          order.items.map((item) => {
            item["status"] = order.status;
            item["payment"] = order.payment;
            item["paymentMethod"] = order.paymentMethod;
            item["date"] = order.date;
            item["address"] = `${order.address.street} ${order.address.state}`;
            item[
              "name"
            ] = `${order.address.firstName} ${order.address.lastName}`;
            item["zipcode"] = order.zipcode;
            item["phone"] = order.phone;
            allOrdersItem.push(item);
          });
        });
        setorderData(allOrdersItem.reverse());
      }
    } catch (error) {}
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      <div>
        {orderData.map((item, index) => (
          <div
            key={index}
            className="py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div className="flex items-start gap-6 text-sm">
              <img className="w-16 sm:w-20" src={item.image[0]} alt="" />
              <div>
                <p className="sm:text-base font-medium">{item.name}</p>
                <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                  <p>
                    {currency}
                    {item.price}
                  </p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Size: {item.size}</p>
                </div>
                <p className="mt-1">
                  Date:{" "}
                  <span className=" text-gray-400">
                    {new Date(item.date).toDateString()}
                  </span>
                </p>
                <p className="mt-1">
                  Payment:{" "}
                  <span className=" text-gray-400">{item.paymentMethod}</span>
                </p>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-between">
              <div className="flex items-center gap-2">
                <p className="min-w-2 h-2 rounded-full bg-green-500"></p>
                <p className="text-sm md:text-base">{item.status}</p>
              </div>
              {item.status !== "Delivered" && (
                <button
                  onClick={loadOrderData}
                  className="border px-4 py-2 text-sm font-medium rounded-sm"
                >
                  Track Order
                </button>
              )}
              {item.status === "Delivered" && (
                <button
                  onClick={() => generateInvoicePDF(item)}
                  className="border px-4 py-2 text-sm font-medium rounded-sm"
                >
                  Download Invoice
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
