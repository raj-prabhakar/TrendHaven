import mongoose from 'mongoose';

// Define the OTP schema
const otpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,  // Refers to the User model
    ref: 'User',
    required: true,
    unique: true  // Ensure userId is unique
  },
  otpNumber: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true
  }
});

// Create the OTP model
const OTP = mongoose.models.OTP || mongoose.model('OTP', otpSchema);

// Export the OTP model
export default OTP;
