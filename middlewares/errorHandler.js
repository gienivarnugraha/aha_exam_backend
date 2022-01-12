require("dotenv").config();

module.exports = (err, req, res, next) => {
  //if (process.env.PRODUCTION === false) console.log("from error handler", err);

  console.log("from handler", err.message);

  let message;
  let type;
  let status;
  switch (err.name) {
    case "loginError":
      status = 400;
      type = "login";
      message = err.message;
      break;
    case "verificationError":
      status = 400;
      type = "verification";
      message = err.message;
      break;
    case "registerError":
      status = 400;
      type = "register";
      message = err.message;
      break;
    case "validationError":
      status = 400;
      type = "validation";
      message = err.message;
      break;
    case "JsonWebTokenError":
      status = 401;
      message = err.message;
      break;
    default:
      status = 500;
      message = err.message || "Internal Server Error";
      break;
  }
  res.status(err.status || status).json({ error: true, message, type });
};
