// * Import modules
const axios = require("axios");

// * Import helpers
const { verifyToken, tokenGenerate } = require("../helpers/jwt.js");
const { hashPassword } = require("../helpers/bcrypt.js");
const { googleLink } = require("../helpers/google.js");

// * Import Models
const User = require("../models/user.js");

class PageController {
  // Home page
  static async loginPage(req, res, next) {
    try {
      return res.render("login", { googleLink });
    } catch (error) {
      next(error);
    }
  }

  // Register page
  static async registerPage(req, res) {
    //let error = res.flash("registerError");
    return res.render("register", { googleLink });
  }

  // Register page
  static async resetPasswordPage(req, res) {
    return res.render("reset");
  }

  // Dashboard page
  static async dashboardPage(req, res) {
    try {
      return res.render("dashboard", { userInfo: req.user });
    } catch (error) {
      return res.redirect("/");
    }
  }

  // Callback from google auth page
  static async googleAuthCallback(req, res) {
    try {
      if (req.query.error) {
        // The user did not give us permission.
        return res.redirect("/");
      } else {
        oauth2Client.getToken(req.query.code, async (err, token) => {
          if (!token) return res.redirect("/");

          if (err) console.log(err);

          const { data } = await axios({
            url: "https://www.googleapis.com/oauth2/v2/userinfo",
            method: "get",
            headers: {
              Authorization: `Bearer ${token.access_token}`,
            },
          });

          const user = await User.findOne({ email: data.email });

          if (!user) {
            let newUser = await User.create({
              email: data.email,
              name: data.name,
              password: hashPassword("admin"),
              isVerified: true,
              registerSource: "google",
              isOnline: true,
              loginTimes: 1,
            });

            res.cookie("accesstoken", tokenGenerate({ id: newUser._id }));
          } else {
            await user.update({
              isOnline: true,
              $inc: { loginTimes: 1 },
            });

            // Store the credentials given by google into a jsonwebtoken in a cookie called 'jwt'
            res.cookie("accesstoken", tokenGenerate({ id: user._id }));
          }
          return res.redirect("/dashboard");
        });
      }
    } catch (error) {
      next(error);
    }
  }

  //* get logged in user data using accesstoken
  static async getUserData(accesstoken) {
    try {
      const decode = verifyToken(accesstoken);

      const user = await User.findById(decode.id);

      return user;
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PageController;
