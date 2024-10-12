import mongoose from "mongoose";
import productModel from "../models/productModel.js"; // Adjust the path according to your file structure
import reviewModel from "../models/reviewModel.js";

import "dotenv/config";


const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://raj:2WgEu5EaScsvCUA5@forever-backend.rtoqd.mongodb.net/?retryWrites=true&w=majority&appName=Forever-Backend"
    );
    console.log("DB Connected");
  } catch (error) {
    console.error("DB Connection Error:", error);
  }
};

// Migration function to ensure all products have a rating
const migrateProducts = async () => {
  try {
    // 1. Update all products that don't have `rating` and `numberOfReviews`
    await productModel.updateMany(
      {
        $or: [
          { rating: { $exists: false } },
          { numberOfReviews: { $exists: false } },
        ],
      },
      { $set: { rating: 0, numberOfReviews: 0 } }
    );
    console.log("Products rating and numberOfReviews migration completed.");

    // 2. Update all reviews that don't have `rating`
    await reviewModel.updateMany(
      { rating: { $exists: false } },
      { $set: { rating: 0 } }
    );
    console.log("Reviews rating migration completed.");

    // Optional: If you want to verify the changes, you can query and log updated documents
    const updatedProducts = await productModel.find({
      rating: 0,
      numberOfReviews: 0,
    });
    const updatedReviews = await reviewModel.find({ rating: 0 });

    console.log(`Updated Products:`, updatedProducts.length);
    console.log(`Updated Reviews:`, updatedReviews.length);
  } catch (error) {
    console.error("Error in migration:", error);
  }
};

// Main function to run the migration
const runMigration = async () => {
  await connectDB(); // Connect to MongoDB
  await migrateProducts(); // Run migration logic
  mongoose.connection.close(); // Close the connection after migration
};

// Execute the migration
runMigration();
