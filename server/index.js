const express = require("express");
const passport = require("passport");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const session = require("express-session");
const path = require("path");
require("dotenv").config();
const { secret } = require("./config/auth.config");
const router = require("./routes");
const { notFound, errorHandler } = require("./middlewares/errorMiddlware");

const app = express();

// Create HTTP server for Socket.IO
const server = http.createServer(app);

// CORS setup
var corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Session setup
app.use(
  session({
    secret: secret,
    resave: true,
    saveUninitialized: true,
  })
);

// Body parser setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Static files
app.use(express.static(path.join(__dirname, "../../public")));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Routes setup
app.use(router);

// Not found middleware
app.use(notFound);

// Internal server error middleware
app.use(errorHandler);

// Start the server
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
