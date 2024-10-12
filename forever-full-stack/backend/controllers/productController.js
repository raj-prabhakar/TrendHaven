import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";
import reviewModel from "../models/reviewModel.js";
import userModel from "../models/userModel.js";

// function for add product
const getReviewsOfAPArticularProduct = async (req, res) => {
  const { productId } = req.params; // Get productId from the request params
  // console.log(productId, "here");
  try {
    // Check if the product exists
    const product = await productModel.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Fetch all reviews for the given productId
    const reviews = await reviewModel
      .find({ productId }) // Find reviews with matching productId
      .populate("userId", "name") // Populate only the user's name
      .sort({ dateCreated: -1 }); // Sort reviews by most recent first

    if (reviews.length === 0) {
      return res
        .status(200)
        .json({ success: true, message: "No reviews found", reviews: [] });
    }

    // Return the list of reviews
    return res.status(200).json({ success: true, reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const addCommentToProduct = async (req, res) => {
  const { userId, text, productId, rating } = req.body;

  console.log(userId, text, productId, rating);

  try {
    // Check if the product exists and populate its reviews with full review data
    const product = await productModel.findById(productId).populate({
      path: 'reviews',
      model: 'review',
    });
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Check if the user exists
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    let Rating = parseFloat(rating);

    // Create a new review
    const newReview = new reviewModel({
      userId,
      text,
      productId,
      rating: Rating, // Make sure to store the rating as a number
    });

    // Save the new review to the database
    const savedReview = await newReview.save();

    // Add the new review reference to the product's reviews array
    product.reviews.push(savedReview._id);

    // Increment the number of reviews for the product
    product.numberOfReviews = product.reviews.length;

    // Calculate the new average rating for the product, including the new review
    let totalRating = 0.0;

    // Fetch all existing reviews including the new one and calculate cumulative rating
    for (let review of product.reviews) {
      const fetchedReview = await reviewModel.findById(review); // Fetch each review by ID
      totalRating += parseFloat(fetchedReview.rating); // Accumulate ratings
    }

    console.log(totalRating, product.numberOfReviews);

    product.rating = totalRating / product.numberOfReviews; // New average rating

    // Save the updated product details
    await product.save();

    // Return the saved review
    return res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: savedReview,
    });
  } catch (error) {
    console.error("Error adding review:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};



const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      subCategory,
      sizes,
      bestseller,
    } = req.body;

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const images = [image1, image2, image3, image4].filter(
      (item) => item !== undefined
    );

    let imagesUrl = await Promise.all(
      images.map(async (item) => {
        let result = await cloudinary.uploader.upload(item.path, {
          resource_type: "image",
        });
        return result.secure_url;
      })
    );

    const productData = {
      name,
      description,
      category,
      price: Number(price),
      subCategory,
      bestseller: bestseller === "true" ? true : false,
      sizes: JSON.parse(sizes),
      image: imagesUrl,
      date: Date.now(),
    };

    console.log(productData);

    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: "Product Added" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// function for list product
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// function for removing product
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Product Removed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// function for single product info
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  listProducts,
  addProduct,
  removeProduct,
  singleProduct,
  getReviewsOfAPArticularProduct,
  addCommentToProduct,
};
