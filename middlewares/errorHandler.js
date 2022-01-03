require("dotenv").config();

const { googleLink } = require("../helpers/google.js");

module.exports = (err, req, res, next) => {
  //if (process.env.PRODUCTION === false) console.log("from error handler", err);

  console.log("from handler", err.message);

  let message;
  switch (err.name) {
    case "loginError":
      message = err.message;
      break;
    case "registerError":
      res.render("register", { googleLink, message: err.message, error: true });
      break;
    case "validationError":
      res.render(err.path, { googleLink, message: err.message, error: true });

      break;
    case "JsonWebTokenError":
      message = err.message;
      break;
    default:
      message = err.message || err.msg || "Internal Server Error";
      break;
  }
  res.render("login", { googleLink, message: message, error: true });
};
