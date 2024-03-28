const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

const generateToken = (user) => {
  const secret = process.env.SECRET_KEY;
  const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "15min" });
  return token;
};

const sendVerificationEmail = (user, token) => {
  //console.log('tis user', user[0])
  //console.log('This is user in nodemailer ', user[0][0].email)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "khpa34229@gmail.com",
      pass: process.env.PASS_KEY,
    },
  });

  const mailOptions = {
    from: "khpa34229@gmail.com",
    to: user[0][0].email,
    subject: "Verify your account",
    html: `<body><h3>Hi, ${user[0][0].username}</h3><h2>This is your token ${token}</h2></body>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

const sendRejectionEmail = (userEmail, userName, rejectionMessage) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "khpa34229@gmail.com",
      pass: process.env.PASS_KEY,
    },
  });

  const mailOptions = {
    from: "khpa34229@gmail.com",
    to: userEmail,
    subject: "Course Advising Form Rejection",
    html: `<body><h3>Hi, ${userName}</h3><p>Your course advising form has been reviewed and unfortunately, it has been rejected due to the following reason:</p><p>${rejectionMessage}</p></body>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

const sendApprovalEmail = (userEmail, userName) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "khpa34229@gmail.com",
      pass: process.env.PASS_KEY,
    },
  });

  const mailOptions = {
    from: "khpa34229@gmail.com",
    to: userEmail[0][0].email,
    subject: "Course Advising Form Approval",
    html: `<body><h3>Hi, ${userName[0][0].username}</h3><p>Congratulations! Your course advising form has been reviewed and approved.</p></body>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

module.exports = {
  generateToken,
  sendVerificationEmail,
  sendRejectionEmail,
  sendApprovalEmail,
};
