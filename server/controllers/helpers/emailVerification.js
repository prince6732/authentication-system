const transporter = require("../helpers/nodemailer");
const prisma = require("../../prisma/prismaClient/prismaClient");
const emailVerificationTemplate = require("../gmailTemplates/emailVerification");

function generateRandomCode() {
  let token = "";
  for (let i = 0; i < 6; i++) {
    token += Math.floor(Math.random() * 10);
  }
  return token;
}

const sendEmailVerificationCode = async (user) => {
  const code = generateRandomCode();
  const username = user.username;

  // Update user verification code
  await prisma.users.update({
    where: { email: user.email },
    data: { verificationCode: code },
  });

  const mailOptions = {
    from: "topntechofficial@gmail.com",
    to: user.email,
    subject: "Email Verification Code",
    html: emailVerificationTemplate(code, username),
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log("code send for email verification: " + info.response);
    }
  });
};

module.exports = sendEmailVerificationCode;
