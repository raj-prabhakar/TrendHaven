import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: Array, required: true },
  category: { type: String, required: true },
  subCategory: { type: String, required: true },
  sizes: { type: Array, required: true },
  bestseller: { type: Boolean },
  date: { type: Number, required: true },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "review" }], // Array of review references
  numberOfReviews: { type: Number, default: 0 },
  rating: {
    type: Number,
    min: 0, // Minimum rating
    max: 5.0, // Maximum rating
    default: 0, // Default rating value
  },
});

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
