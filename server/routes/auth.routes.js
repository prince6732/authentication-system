const authController = require("../controllers/auth.controller");
const Router = require("express");
const passport = require("passport");
const authRouter = Router();

authRouter.use((req, res, next) => {
  res.header("Access-Control-Allow-Headers", "Origin, Content-Type, Accept");
  next();
});

// sign up
authRouter.post("/api/auth/signup", authController.signup);

// verify email for user register
authRouter.post("/api/auth/verify", authController.verifyEmail);

// login
authRouter.post("/api/auth/login", authController.login);

// logout
authRouter.post("/api/auth/logout", authController.logout);

// getting reset password link
authRouter.post("/api/auth/forgot-password", authController.forgotPassword);

authRouter
  .route("/api/auth/reset-password/:token")
  .get(authController.getResetPassword) // get reset password token
  .post(authController.resetPassword); // reset password

// google login api for flutter app
authRouter.post("/api/auth/google-login", authController.googleLoginForFlutterApp);

// Google login
authRouter
  .route("/auth/google")
  .get(passport.authenticate("google", { scope: ["profile", "email"] }));
authRouter
  .route("/auth/google/callback")
  .get(
    passport.authenticate("google", { failureRedirect: "/" }),
    authController.handleOAuthSignIn
  );

// Facebook login
authRouter.route("/auth/facebook").get(passport.authenticate("facebook"));
authRouter
  .route("/auth/facebook/callback")
  .get(
    passport.authenticate("facebook", { failureRedirect: "/" }),
    authController.handleOAuthSignIn
  );

module.exports = authRouter;
