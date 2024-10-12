import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import { Rating } from "@mui/material";
import Stack from "@mui/material/Stack";

const ProductItem = ({ id, image, name, price, rating }) => {
  const { currency } = useContext(ShopContext);

  return (
    <Link
      onClick={() => scrollTo(0, 0)}
      className="text-gray-700 cursor-pointer"
      to={`/product/${id}`}
    >
      <div className="overflow-hidden">
        <img
          className="hover:scale-110 transition ease-in-out"
          src={image[0]}
          alt=""
        />
      </div>
      <p className="pt-3 pb-1 text-sm">{name}</p>
      <div className="flex flex-row justify-between">
        <p className="text-sm font-medium">
          {currency}
          {price}
        </p>
        <Stack spacing={1}>
          <Rating
            name="half-rating"
            value={rating}
            readOnly
            size="small" // Adjust the size of the rating component
          />
        </Stack>
      </div>
    </Link>
  );
};

export default ProductItem;
