import express from 'express';
import { loginUser,registerUser,adminLogin, sendResetPasswordOtp, verifyPassResetOtp, setNewPassword, googleLogin } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/register',registerUser)
userRouter.post('/login',loginUser)
userRouter.post('/admin',adminLogin)
userRouter.post('/forgot-pass-otp', sendResetPasswordOtp)
userRouter.post('/verify-pass-otp', verifyPassResetOtp)
userRouter.post('/set-new-pass', setNewPassword)
userRouter.post("/google-login", googleLogin);

export default userRouter;