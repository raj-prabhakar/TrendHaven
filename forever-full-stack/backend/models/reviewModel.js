import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the User
  text: { type: String, required: true }, // Review text
  dateCreated: { type: Date, default: Date.now }, // Date the review was created
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true }, // Reference to the Product
});

const reviewModel = mongoose.models.review || mongoose.model("review", reviewSchema);

export default reviewModel;
