const { verifyToken } = require("../helpers/jwt.js");
const User = require("../models/user.js");

const authentication = async (req, res, next) => {
  try {
    const decode = verifyToken(req.cookies.accesstoken);

    let user = await User.findById(decode.id);

    if (user) {
      req.user = user;
      next();
    } else {
      return next({
        error: true,
        message: "Your session is over, please re-login",
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { authentication };
