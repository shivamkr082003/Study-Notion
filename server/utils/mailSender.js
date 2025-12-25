const nodemailer = require("nodemailer");
require("dotenv").config();

const mailSender = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",   // 🔥 FIXED
      port: 587,                // 🔥 REQUIRED
      secure: false,            // 🔥 REQUIRED for 587
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"StudyNotion" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    });

    console.log("Email sent successfully:", info.response);
    return info;
  } catch (error) {
    console.log("MAIL ERROR:", error.message);
    throw error;
  }
};

module.exports = mailSender;


