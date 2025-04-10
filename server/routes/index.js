const Router = require("express");
const authRouter = require("./auth.routes");

const router = Router();

router.use(authRouter); // auth routes

module.exports = router;
