require("dotenv").config();

const jwt = require("jsonwebtoken");

const JWTsecret = process.env.JWT_SECRET;

const tokenGenerate = (payload) => {
  return jwt.sign(payload, JWTsecret, { expiresIn: "1d" });
};

const verifyToken = (token) => {
  return jwt.verify(token, JWTsecret);
};

module.exports = { tokenGenerate, verifyToken };
