import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import Slider from "@mui/material/Slider";
import Rating from "@mui/material/Rating"; // Import Rating from Material-UI

const Collection = () => {
  const { products, search, showSearch, currency } = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState("relavent");
  const [price, setPrice] = useState([0, 100]); // Example initial value
  const [rating, setRating] = useState(0); // State for rating filter

  const toggleCategory = (e) => {
    if (category.includes(e.target.value)) {
      setCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setCategory((prev) => [...prev, e.target.value]);
    }
  };

  const toggleSubCategory = (e) => {
    if (subCategory.includes(e.target.value)) {
      setSubCategory((prev) => prev.filter((item) => item !== e.target.value));
    } else {
      setSubCategory((prev) => [...prev, e.target.value]);
    }
  };

  const applyFilter = () => {
    let productsCopy = products.slice();

    if (showSearch && search) {
      productsCopy = productsCopy.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        category.includes(item.category)
      );
    }

    if (subCategory.length > 0) {
      productsCopy = productsCopy.filter((item) =>
        subCategory.includes(item.subCategory)
      );
    }

    // Price Filter
    productsCopy = productsCopy.filter(
      (item) => item.price >= price[0] && item.price <= price[1]
    );

    // Rating Filter
    if (rating > 0) {
      productsCopy = productsCopy.filter((item) => item.rating >= rating);
    }

    setFilterProducts(productsCopy);
  };

  // Retrieve filters from localStorage if available
  useEffect(() => {
    setFilterProducts(products);
  }, []);

  // Function to reset filters
  const resetFilters = () => {
    setCategory([]);
    setSubCategory([]);
    setPrice([0, 100]); // Reset price to default range
    setRating(0); // Reset rating
    setFilterProducts(products);
    setSortType("relavent");
  };

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();

    switch (sortType) {
      case "low-high":
        setFilterProducts(fpCopy.sort((a, b) => a.price - b.price));
        break;

      case "high-low":
        setFilterProducts(fpCopy.sort((a, b) => b.price - a.price));
        break;

      case "ratings":
        setFilterProducts(fpCopy.sort((a, b) => b.rating - a.rating));
        break;

      default:
        applyFilter();
        break;
    }
  };

  // useEffect(() => {
  //   applyFilter();
  // }, [category, subCategory, search, showSearch, products, price, rating]);

  useEffect(() => {
    sortProduct();
  }, [sortType]);

  useEffect(() => {
    applyFilter();
  }, [search]);

  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">
      {/* Filter Options */}
      <div className="min-w-60">
        <p
          onClick={() => setShowFilter(!showFilter)}
          className="my-2 text-xl flex items-center cursor-pointer gap-2"
        >
          FILTERS
          <img
            className={`h-3 sm:hidden ${showFilter ? "rotate-90" : ""}`}
            src={assets.dropdown_icon}
            alt=""
          />
        </p>
        {/* Category Filter */}
        <div
          className={`border border-gray-300 pl-5 py-3 mt-6 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Men"}
                onChange={toggleCategory}
              />{" "}
              Men
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Women"}
                onChange={toggleCategory}
              />{" "}
              Women
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Kids"}
                onChange={toggleCategory}
              />{" "}
              Kids
            </p>
          </div>
        </div>

        {/* SubCategory Filter */}
        <div
          className={`border border-gray-300 pl-5 py-3 my-5 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">TYPE</p>
          <div className="flex flex-col gap-2 text-sm font-light text-gray-700">
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Topwear"}
                onChange={toggleSubCategory}
              />{" "}
              Topwear
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Bottomwear"}
                onChange={toggleSubCategory}
              />{" "}
              Bottomwear
            </p>
            <p className="flex gap-2">
              <input
                className="w-3"
                type="checkbox"
                value={"Winterwear"}
                onChange={toggleSubCategory}
              />{" "}
              Winterwear
            </p>
          </div>
        </div>

        {/* Price Filter */}
        <div
          className={`border border-gray-300 pl-5 py-3 my-5 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">PRICE</p>
          <div className="flex items-center w-[200px]">
            <label className="mr-2 font-semibold">{`${price[0]} ${currency}`}</label>
            <Slider
              value={price}
              onChange={(e, newValue) => setPrice(newValue)}
              valueLabelDisplay="off" // Disable the default value label
              aria-labelledby="range-slider"
              min={0}
              max={100}
              className="flex-1 mx-2" // Adjust the width and margins as needed
            />
            <label className="ml-2 font-semibold">{`${price[1]} ${currency}`}</label>
          </div>
        </div>

        {/* Rating Filter */}
        <div
          className={`border border-gray-300 pl-5 py-3 my-5 ${
            showFilter ? "" : "hidden"
          } sm:block`}
        >
          <p className="mb-3 text-sm font-medium">RATING Above</p>
          <Rating
            name="simple-controlled"
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue);
            }}
          />
        </div>

        {/* Reset Filter Button */}
        <div className="my-5 flex flex-row mt-2">
          <button
            onClick={applyFilter}
            className="bg-black text-white py-2 px-4 mr-2 rounded"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="bg-black text-white py-2 px-4 rounded"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex-1">
        <div className="flex justify-between text-base sm:text-2xl mb-4">
          <Title text1={"ALL"} text2={"COLLECTIONS"} />
          {/* Product Sort */}
          <select
            onChange={(e) => setSortType(e.target.value)}
            className="border-2 border-gray-300 text-sm px-2"
            defaultValue="relevant"
          >
            <option value="relavent">Sort by: Relevant</option>
            <option value="low-high">Sort by Price: Low to High</option>
            <option value="high-low">Sort by Price: High to Low</option>
            <option value="ratings">Sort by Ratings</option>
          </select>
        </div>

        {/* Map Products */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6">
          {filterProducts.map((item, index) => (
            <ProductItem
              key={index}
              name={item.name}
              id={item._id}
              price={item.price}
              image={item.image}
              rating={item.rating} // Pass rating to ProductItem
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
