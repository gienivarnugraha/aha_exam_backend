const User = require("../models/index.js").User;

const { tokenGenerate } = require("./jwt.js");
const { hashPassword } = require("./bcrypt.js");

const findOrCreateUser = async (data) => {
  try {
    let user = await User.findOne({ where: { email: data.email } });

    if (user === null || user === undefined) {
      user = await User.create({
        email: data.email,
        name: data.name,
        password: hashPassword("Password123!"),
        isVerified: true,
        isOnline: true,
        loginTimes: 1,
        isPasswordDefault: true,
        avatar: data.picture || "",
      });
    } else {
      await user.update({
        isOnline: true,
      });
      if (user.avatar === null && data.picture !== null) {
        await user.update({
          avatar: data.picture,
        });
      }
      await user.increment("loginTimes");
    }

    return tokenGenerate({ id: user.id });
  } catch (error) {
    console.log(error);
  }
};

module.exports = { findOrCreateUser };
