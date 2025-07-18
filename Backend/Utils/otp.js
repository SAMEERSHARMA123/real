const nodemailer = require("nodemailer");
require('dotenv').config();
   const gmail = process.env.GMAIL;
   const pass = process.env.PASS;
   
const sendOtpMail = async (email, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmail,      
        pass: pass,     
      },
    });

    const mailOptions = {
      from: gmail,
      to: email,
      subject: "Your OTP Code",
      html: `<p>Your OTP for login is: <b>${otp}</b></p>`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP sent successfully to ${email}`);
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP. Please try again.");
  }
};

module.exports = {sendOtpMail};
