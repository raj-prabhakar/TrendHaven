import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
// import { generateOTP } from "../utils/otp generation and validation";
import sendEmail from "../utils/sendEmail.js";
import { generateOTP } from "../utils/otp generation and validation";
import OTP from "../models/OTP.js";
import { OAuth2Client } from "google-auth-library";
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User doesn't exists" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id);
      const id = user._id;
      res.json({ success: true, token, id });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const getUserData = async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(404).json({ success: false, message: "Invalid user id" });
  }
  const user = await userModel.findOne({ _id: userId });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  return res.status(200).json({ success: true, user });
};

// Route for Google login
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
    });

    const { email, name, picture, sub: googleId } = ticket.getPayload(); // Extract user details from Google token

    // Check if user exists in the database
    let user = await userModel.findOne({ email });

    if (!user) {
      // If user doesn't exist, create a new one
      return res
        .status(404)
        .json({ success: false, message: "Firstly Sign Up" });
    }

    // Create a JWT token for your app
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Set expiration time if needed
    });

    // Respond with the token and user ID
    res.json({ success: true, token: jwtToken, id: user._id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Google login failed" });
  }
};

// Route for user register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // checking user already exists or not
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();

    const token = createToken(user._id);

    // const otp = generateOTP();

    await sendEmail(user.email, 1, name, 1);

    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const sendResetPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const otp = generateOTP(); // Assuming this function generates the OTP
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Set OTP expiration time (10 minutes)

    // Remove any existing OTP for the user
    await OTP.findOneAndDelete({ userId: user._id });

    // Save the new OTP in the database
    const otpEntry = new OTP({
      userId: user._id,
      otpNumber: otp,
      expiresAt,
    });

    await otpEntry.save();

    // Send OTP email
    await sendEmail(email, otp, "", 2); // Assuming sendEmail is your utility function

    return res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const verifyPassResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // Check if user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Find OTP for this user
    const otpEntry = await OTP.findOne({ userId: user._id });

    if (!otpEntry) {
      return res.json({ success: false, message: "OTP not found" });
    }

    // Check if OTP has expired
    if (otpEntry.expiresAt < new Date()) {
      return res.json({ success: false, message: "OTP has expired" });
    }

    // Check if OTP matches
    if (otpEntry.otpNumber !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    // OTP is valid and can now be used for password reset
    return res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const setNewPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    // Check if user exists
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // Hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user password
    await userModel.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });

    // Generate token
    const token = createToken(user._id);

    // Send email notification (assuming user.name exists)
    await sendEmail(email, 1, user.name, 3);

    // Respond with success
    res.json({ success: true, token, id: user._id });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  loginUser,
  registerUser,
  adminLogin,
  sendResetPasswordOtp,
  verifyPassResetOtp,
  setNewPassword,
  googleLogin,
  getUserData
};
