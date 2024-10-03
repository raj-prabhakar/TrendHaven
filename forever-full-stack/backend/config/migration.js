import mongoose from "mongoose";
// import dotenv from 'dotenv'; // Import dotenv
import productModel from "../models/productModel.js"; // Adjust the path according to your file structure
// import connectDB from './mongodb.js';
import 'dotenv/config'

// Load environment variables from .env file
// dotenv.config(); // Call dotenv.config() to load environment variables

// Check if MONGODB_URI is being fetched correctly
// console.log(process.env.MONGODB_URI, "hereeeeeeeeeeee");

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://raj:2WgEu5EaScsvCUA5@forever-backend.rtoqd.mongodb.net/?retryWrites=true&w=majority&appName=Forever-Backend');
    console.log("DB Connected");
  } catch (error) {
    console.error("DB Connection Error:", error);
  }
};

// Migration function to ensure all products have a rating
const migrateProducts = async () => {
  try {
    const products = await productModel.find(); // Fetch all products
    // Iterate over each product and check/update the rating
    for (const product of products) {
      // Check if the rating field exists
      if (!product.rating) {
        product.rating = 0; // Set the default rating if it doesn't exist
        await product.save(); // Save the updated product document back to the database
        console.log(`Updated Product ID: ${product._id} with default rating of 0`);
      }
    }

    console.log("Product migration for rating completed successfully.");
  } catch (error) {
    console.error("Migration error:", error);
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
