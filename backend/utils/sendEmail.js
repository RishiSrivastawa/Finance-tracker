const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
    });

    await transporter.sendMail({
      from: `"Finance Tracker" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("✅ OTP email sent to:", to);
    return true;
  } catch (err) {
    console.error("❌ Email failed:", err.message);
    return false;
  }
};

module.exports = sendEmail;
