import nodemailer from "nodemailer";

// Function to send email.
const sendEmail = async (email, otp, name, msg_Id) => {
  try {
    const transport = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true, //ssl
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    let Subject, message;

    if (msg_Id == 1) {
      Subject = "Welcome to Forever";
      message = `Dear ${name},

Welcome to Forever!

We’re excited to have you as part of our fashion-forward community. At Forever, we believe that style is an expression of who you are, and we’re here to help you find pieces that truly reflect your unique personality.

Here’s what you can look forward to:
- **Exclusive Collections**: Explore our curated collections that feature the latest trends and timeless classics.
- **Personalized Recommendations**: Receive tailored suggestions based on your style preferences and shopping history.
- **Special Offers**: Enjoy access to exclusive discounts, promotions, and early access to sales.

To get started, we invite you to browse our [new arrivals](#) and check out our [style guide](#) for inspiration. If you have any questions or need assistance, our customer service team is always here to help.

Thank you for choosing Forever. We’re thrilled to be a part of your style journey and can’t wait to see how you express yourself with our fashion!

Happy shopping!

Best regards,
The Forever Team
[Website](#)
[Contact Us](#)`;

    } else if (msg_Id == 2) {
      Subject = "Password Reset OTP - Forever";
      message = `Dear User,
    
We received a request to reset the password for your Forever account. Please use the OTP below to complete the password reset process:
    
Your OTP is: ${otp}
    
If you did not request a password reset, please ignore this email. Your account remains secure.
    
If you have any questions, feel free to reach out to our support team.
    
Best regards,
The Forever Team`;
    }

    else if (msg_Id == 3) {
        Subject = "Password Reset Successful";
        message = `Dear ${name},

We are pleased to inform you that your password has been successfully reset. You may now log in to your account using your new credentials.

If you did not initiate this request or believe there has been unauthorized access to your account, please contact our support team immediately.

Thank you for your continued trust.

Best regards,  
Forever Support Team
`;
    }
    // else if (msg_Id == 4) {
    //     Subject = "Account Verification done";
    //     message = "ChairBord Notification: Your account has been verified by Admin.";
    // }
    // else if (msg_Id == 5) {
    //     Subject = "Account Created: Verification Pending";
    //     message = "ChairBord Update: Your account has been created. Please wait for verification by ChairBord before using the services.";
    // }
    // else if (msg_Id == 6) {
    //     Subject = "ChairBord Account Created: Set Password"
    //     message = `ChairBord Account Notification: Your account has been created by Admin. You can use your mobile number, email ID, or the company ID assigned to you: ${otp}. Please use the Forget Password feature to set your password.`;
    // }
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: Subject,
      text: message,
    };
    // console.log(mailOptions);
    const results = await transport.sendMail(mailOptions);
    console.log("Email sent successfully", results);
    return results;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export default sendEmail;
