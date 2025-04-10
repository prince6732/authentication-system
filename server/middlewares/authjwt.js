const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");
const prisma = require("../prisma/prismaClient/prismaClient");

const verifyToken = (req, res, next) => {
  let token = req.headers["authorization"];

  if (!token) {
    return res.status(403).send({ message: "No token provided!" });
  }
  if (!token.startsWith("Bearer ")) {
    res.status(403).send({ message: "Invalid token format." });
  }

  if (token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
    jwt.verify(token, config.secret, async (err, decoded) => {
      if (err) {
        console.log("verify Error: ", err);
        return res.status(401).json({ message: "Unauthorized!" });
      };
      req.userId = decoded.id;
      req.user = await prisma.users.findUnique({
        where: { id: Number(req.userId) },
      });
      next();
    });
  }
};

module.exports = {
  verifyToken,
};
