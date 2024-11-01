import express from "express";

import {
  checkout,
  paymentVerification,
} from "../controllers/razorpayController.js";

const razorpayRouter = express.Router();

razorpayRouter.post("/checkout", checkout);
razorpayRouter.post("/paymentverification", paymentVerification);

export default razorpayRouter;
