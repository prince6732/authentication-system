const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("../config/auth.config");
const prisma = require("../prisma/prismaClient/prismaClient");
const asyncHandler = require("../middlewares/asyncHandler");
const passport = require("passport");
require("dotenv").config();
const sendEmailVerificationCode = require("./helpers/emailVerification");
const sendForgetPasswordToken = require("./helpers/forgetPassword");

const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;

//oAuth Strategy
const oAuthStrategy = asyncHandler(async (provider, profile, done) => {
  try {
    const email =
      profile.emails && profile.emails.length > 0
        ? profile.emails[0].value
        : null;
    if (!email) {
      return done(null, false, { message: "email is required." });
    }

    // check if a user with same email already exist
    let user = await prisma.users.findUnique({
      where: { email },
    });

    if (user) {
      if (!user.providerId || user.providerName !== provider) {
        user = await prisma.users.update({
          where: { email },
          data: {
            providerId: profile.id,
            providerName: provider,
            isVerified: true,
            emailVerifiedAt: new Date(),
          },
        });
      }
    } else {
      // create a new user if no user with the same email exists
      user = await prisma.users.create({
        data: {
          username: profile.displayName,
          email,
          providerId: profile.id,
          isVerified: true,
          emailVerifiedAt: new Date(),
        },
      });
    }

    // generate token for user
    const userToken = jwt.sign({ id: user.id }, config.secret, {
      algorithm: "HS256",
      allowInsecureKeySizes: true,
      expiresIn: "24h",
    });

    return done(null, {
      id: user.id,
      accessToken: userToken,
      user,
    });
  } catch (error) {
    console.error(`${provider} Authenticate Error:`, error);
    done(error);
  }
});

// Google Login API for Flutter
const googleLoginForFlutterApp = async (req, res) => {
  try {
    const { providerName, email, name, id } = req.body; // Get the token from Flutter app

    if (providerName !== "google" && providerName !== "facebook") {
      return res.status(400).json({ message: "invalid provider" });
    }

    if (!email) {
      return res
        .status(400)
        .json({ message: "Google account must have an email" });
    }

    // Check if user already exists
    let user = await prisma.users.findUnique({
      where: { email },
    });

    // if (!user) {
    //   // Create new user
    //   user = await prisma.users.create({
    //     data: {
    //       username: name,
    //       email,
    //       providerId: id,
    //       providerName: providerName,
    //       isVerified: true,
    //       emailVerifiedAt: new Date(),
    //     },
    //   });
    // }
    if (user) {
      user = await prisma.users.update({
        where: { email },
        data: {
          username: name,
          email,
          providerId: id,
          providerName: providerName,
          isVerified: true,
          emailVerifiedAt: new Date(),
        },
      });
    } else {
      // create a new user if no user with the same email exists
      user = await prisma.users.create({
        data: {
          username: name,
          email,
          providerId: id,
          providerName: providerName,
          isVerified: true,
          emailVerifiedAt: new Date(),
        },
      });
    }

    // Generate JWT token
    const accessToken = jwt.sign({ id: user.id }, config.secret, {
      algorithm: "HS256",
      expiresIn: "24h",
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      accessToken,
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Configure Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8080/auth/google/callback",
    },
    async (token, tokenSecret, profile, done) => {
      oAuthStrategy("google", profile, done);
    }
  )
);

// Configure Facebook Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:8080/auth/facebook/callback",
      profileFields: ["id", "displayName", "emails"], // Request the email field
    },
    async (token, tokenSecret, profile, done) => {
      oAuthStrategy("facebook", profile, done);
    }
  )
);

// Social sign in
const handleOAuthSignIn = async (req, res) => {
  try {
    // Successful Social sign-in
    const { accessToken } = req.user;
    const { user } = req.user;
    if (user.email == null) {
      user.email = "";
    }
    res.redirect(
      `${process.env.FRONTEND_URL}/login/?token=${accessToken}&id=${user.id}&username=${user.username}&email=${user.email}`
    );
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

// auth logout
const handleOAuthLogout = async (req, res) => {
  res.clearCookie("accessToken");
  const { accessToken } = req.user;
  res.redirect(`http://localhost:5173/verify-token?token=${accessToken}`);
};

// Serialize user into the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser((userId, done) => {
  prisma.users
    .findUnique({
      where: { id: userId },
    })
    .then((user) => {
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    })
    .catch((err) => {
      done(err);
    });
});

// Sign up
const signup = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);

  // to check if user already exist
  const userExist = await prisma.users.findUnique({
    where: { email: email },
  });
  if (userExist) {
    return res.status(400).send({ message: "user already exissssssssssst!" });
  }

  // save user to batabase
  const user = await prisma.users.create({
    data: {
      username: username,
      email: email,
      password: hashedPassword,
    },
  });

  sendEmailVerificationCode(user);
  return res.status(201).json(user.email);
});

//verify email
const verifyEmail = asyncHandler(async (req, res) => {
  const { email, verificationCode } = req.body;

  const user = await prisma.users.findUnique({ where: { email } });
  if (user && user.verificationCode == verificationCode) {
    await prisma.users.update({
      where: { email },
      data: {
        emailVerifiedAt: new Date(),
        isVerified: true,
        verificationCode: null,
      },
    });
    res.status(201).send(user);
    console.log("ready for login");
  } else {
    res.status(401).send({ message: "invalid verification code!" });
  }
});

// get reset password link on gmail
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await prisma.users.findUnique({
    where: { email: email },
  });
  if (!user) {
    return res.status(400).send({
      message: "user not found! please enter a valid email address.",
    });
  }

  const forgotPassword = await prisma.passwordResetToken.findUnique({
    where: { email: email },
  });
  if (
    forgotPassword?.token &&
    forgotPassword?.createdAt > new Date().getTime()
  ) {
    return res.status(400).send({
      message:
        "we already send a link. please check your email for reset password link!",
    });
  }

  await sendForgetPasswordToken(email);
  res.status(200).json({
    message: "Reset password link has been send to to your email address.",
  });
});

// verify email or token
const getResetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const passwordReset = await prisma.passwordResetToken.findFirst({
    where: { token: token },
  });
  if (!passwordReset || passwordReset.createdAt < new Date()) {
    return res.status(404).json({ message: "invalid or expired token!" });
  }
});

// update password
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  const passwordReset = await prisma.passwordResetToken.findFirst({
    where: { token: token },
  });
  if (!passwordReset || passwordReset.createdAt < new Date()) {
    return res.status(400).json({ message: "invalid or expired token!" });
  }
  if (password != confirmPassword) {
    res.status(400).json({ message: "password don't match!" });
  }

  const hashedPassword = bcrypt.hashSync(password, 8);
  // update password
  await prisma.users.update({
    where: { email: passwordReset.email },
    data: { password: hashedPassword },
  });
  // delete password reset token after reset password
  await prisma.passwordResetToken.delete({
    where: { token: token, email: passwordReset.email },
  });

  return res.status(200).json({
    message: "password updated successfully. Redirecting to home page!",
  });
});

// Log in
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // check if user exist
  const user = await prisma.users.findUnique({
    where: { email: email },
  });
  if (!user) {
    return res.status(404).json({ message: "user not found!" });
  }

  // check if user has a password
  if (!user.password) {
    return res.status(400).json({
      message:
        "please log in using your social account or reset your password.",
    });
  }

  // validate the password
  var passwordIsValid = await bcrypt.compareSync(password, user.password);
  if (!passwordIsValid) {
    return res
      .status(401)
      .json({ accessToken: null, message: "invalid password!" });
  }

  // login restriction for unverified users
  if (user && !user.emailVerifiedAt && !user.isVerified) {
    return res
      .status(401)
      .json({ message: "access denied. account not verified!" });
  }

  // generate token
  const token = jwt.sign({ id: user.id.toString() }, config.secret, {
    algorithm: "HS256",
    allowInsecureKeySizes: true,
    expiresIn: "24h", // 24 hours
  });

  // respond with user details and token
  res.status(200).json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    accessToken: token,
  });
});

// Log out
const logout = asyncHandler(async (req, res) => {
  req.session = null;
  return res.status(200).send({
    message: "You've been signed out!",
  });
});

module.exports = {
  signup,
  verifyEmail,
  resetPassword,
  getResetPassword,
  forgotPassword,
  login,
  logout,
  handleOAuthSignIn,
  handleOAuthLogout,
  googleLoginForFlutterApp,
};
