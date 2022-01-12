const { verifyToken } = require("../helpers/jwt.js");
const User = require("../models/index.js").User;

const authentication = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decode = verifyToken(token);

    if (!req.user) {
      let user = await User.findOne({ where: { id: decode.id } });

      if (!user) {
        return next({
          status: 404,
          name: "loginError",
          message: "Your account is not found! please register",
        });
      } else {
        req.user = user.dataValues;
      }
    }

    next();
  } catch (error) {
    console.log("auth", error);
    return next({
      status: 401,
      name: "loginError",
      message: "Your session is over, please re-login",
    });
    //next(error);
  }
};

module.exports = { authentication };
