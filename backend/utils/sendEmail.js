const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text }) => {
  try {
    console.log("📧 sendEmail called");
    console.log("From:", process.env.EMAIL_USER, "To:", to);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Finance Tracker" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("✅ Email sent, messageId:", info.messageId);
  } catch (err) {
    console.error("❌ Error sending email:", err);
    throw err;
  }
};

module.exports = sendEmail;
