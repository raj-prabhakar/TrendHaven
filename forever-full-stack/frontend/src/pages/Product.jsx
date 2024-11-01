import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import axios from "axios";
import { toast } from "react-toastify";
import Rating from "@mui/material/Rating"; // Import the Rating component
import Stack from "@mui/material/Stack"; // Import Stack for layout

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, backendUrl } = useContext(ShopContext);
  const [productData, setProductData] = useState(null);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [currentReview, setCurrentReview] = useState({
    userId: localStorage.getItem("userId") || null,
    text: "",
    _productId: productId,
    rating: 0.0,
  });
  const [loading, setLoading] = useState(false);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(2);

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, "0");

    // Determine AM or PM suffix
    const ampm = hours >= 12 ? "PM" : "AM";
    // Convert hours from 24-hour to 12-hour format
    hours = hours % 12;
    hours = hours ? String(hours).padStart(2, "0") : "12"; // The hour '0' should be '12'

    return `${hours}:${minutes} ${ampm} | ${day}/${month}/${year}`;
  };

  const fetchProductData = () => {
    const item = products.find((product) => product._id === productId);
    if (item) {
      setProductData(item);
      setImage(item.image[0]);
    }
  };

  const getReviews = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${backendUrl}/api/product/reviews/${productId}`
      );
      setReviews(response.data.reviews);
    } catch (error) {
      console.log(error);
      toast.error("Failed to fetch reviews.");
    } finally {
      setLoading(false);
      setReviewsOpen(true);
    }
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    if (!currentReview.userId) {
      toast.error("User must be logged in.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${backendUrl}/api/product/add-review/${productId}`, {
        userId: currentReview.userId,
        text: currentReview.text,
        productId,
        rating: currentReview.rating,
      });
      await getReviews();
      setCurrentReview({ ...currentReview, text: "" }); // Clear review input
    } catch (error) {
      console.log(error);
      toast.error("Failed to submit review.");
    } finally {
      setLoading(false);
      window.location.reload(); 
    }
  };

  useEffect(() => {
    fetchProductData();
    getReviews();
  }, [productId, products]);

  if (productData === null) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/*----------- Product Data-------------- */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/*---------- Product Images------------- */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                alt=""
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img className="w-full h-auto" src={image} alt="" />
          </div>
        </div>

        {/* -------- Product Info ---------- */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <p className="mt-5 text-3xl font-medium">
            {currency}
            {productData.price}
          </p>
          <p className="mt-5 text-gray-500 md:w-4/5">
            {productData.description}
          </p>
          {/* --------- Rating Component --------- */}
          <div className="my-4">
            <Stack spacing={1}>
              <Rating
                name="half-rating"
                value={productData.rating || 0}
                precision={0.5}
                readOnly
              />
            </Stack>
          </div>
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.sizes.map((item, index) => (
                <button
                  onClick={() => setSize(item)}
                  className={`border py-2 px-4 bg-gray-100 ${
                    item === size ? "border-orange-500" : ""
                  }`}
                  key={index}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => addToCart(productData._id, size)}
            className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
          >
            ADD TO CART
          </button>
          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* ---------- Description & Review Section ------------- */}
      <div className="mt-20">
        <div className="flex">
          <button onClick={() => setReviewsOpen(false)}>
            <p
              className={
                "border px-5 py-3 text-sm " + (!reviewsOpen ? "font-bold" : "")
              }
            >
              Description
            </p>
          </button>
          <button onClick={() => setReviewsOpen(true)}>
            <p
              className={
                "border px-5 py-3 text-sm " + (reviewsOpen ? "font-bold" : "")
              }
            >
              Reviews ({reviews.length})
            </p>
          </button>
        </div>
        {!reviewsOpen && (
          <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
            <p>
              An e-commerce website is an online platform that facilitates the
              buying and selling of products or services over the internet. It
              serves as a virtual marketplace where businesses and individuals
              can showcase their products, interact with customers, and conduct
              transactions without the need for a physical presence. E-commerce
              websites have gained immense popularity due to their convenience,
              accessibility, and the global reach they offer.
            </p>
            <p>
              E-commerce websites typically display products or services along
              with detailed descriptions, images, prices, and any available
              variations (e.g., sizes, colors). Each product usually has its own
              dedicated page with relevant information.
            </p>
          </div>
        )}

        {reviewsOpen && (
          <div>
            <form
              onSubmit={onSubmitHandler}
              className="flex flex-row justify-start py-2"
            >
              <input
                onChange={(e) =>
                  setCurrentReview({ ...currentReview, text: e.target.value })
                }
                value={currentReview.text}
                type="text"
                className="w-1/2 mt-2 px-3 py-2 border border-gray-800"
                placeholder="Write review here..."
                required
              />
              <div className="flex flex-col px-6 justify-center border border-gray-800 ml-4">
                <p className="text-center mb-2">Give Rating</p>
                <Stack spacing={1}>
                  <Rating
                    name="half-rating"
                    onChange={(e) =>
                      setCurrentReview({
                        ...currentReview,
                        rating: e.target.value,
                      })
                    }
                    defaultValue={0.0}
                    precision={0.5}
                  />
                </Stack>
              </div>
              <div className="mb-2 mt-2">
                <button
                  className="bg-black text-white font-light px-8 py-2 mt-4 ml-5"
                  disabled={loading}
                >
                  {loading ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
            {reviews.length !== 0 &&
              reviews.map((item, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 mb-4 mt-4 shadow-sm bg-white"
                >
                  {/* Review Text */}
                  <div className="flex flex-row justify-between text-gray-800 text-lg leading-relaxed mb-2">
                    {item.text}
                    <div>
                      <Stack spacing={1}>
                        <Rating
                          name="half-rating"
                          defaultValue={item.rating}
                          precision={0.5}
                          readOnly
                        />
                      </Stack>
                    </div>
                  </div>

                  {/* Reviewer's Name and Date */}
                  <div className="flex items-center justify-between">
                    <div className="text-gray-600 text-sm">
                      {item.userId.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(item.dateCreated)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* --------- display related products ---------- */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  );
};

export default Product;
