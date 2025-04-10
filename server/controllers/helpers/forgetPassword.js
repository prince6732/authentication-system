const prisma = require("../../prisma/prismaClient/prismaClient");
const { randomBytes } = require("node:crypto");
const forgotPassowrdTemplate = require("../gmailTemplates/forgetPassword");
const transporter = require("../helpers/nodemailer");

const sendForgetPasswordToken = async (email) => {
  const token = randomBytes(20).toString("hex");
  const expireDate = new Date(Date.now() + 86400000); //24 hours

  await prisma.passwordResetToken.create({
    data: { email, token, createdAt: expireDate },
  });
  const mailOptions = {
    from: "topntechofficial@gmail.com",
    to: email,
    subject: "Reset Password!",
    html: forgotPassowrdTemplate(token),
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("link has been send for reset password: " + info.response);
    }
  });
};

module.exports = sendForgetPasswordToken;
