// * Import Modules
const crypto = require("crypto");

// * Import Models
const User = require("../models/user.js");
const Token = require("../models/token.js");

// * Import Helpers
const { tokenGenerate } = require("../helpers/jwt.js");
const { comparePassword, hashPassword } = require("../helpers/bcrypt.js");
const { sendMail } = require("../helpers/mailer.js");
const { googleLink } = require("../helpers/google.js");

// * Import config
const config = require("../config/config.js");
const { validatePassword } = require("../helpers/validator.js");

class UserController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select("+password");

      if (user) {
        if (comparePassword(password, user.password)) {
          await user.updateOne({
            isOnline: true,
            $inc: { loginTimes: 1 },
          });

          const token = tokenGenerate({ id: user._id });

          return res.cookie("accesstoken", token).redirect("/dashboard");
        } else {
          next({
            name: "loginError",
            message: "Your credentials are not match",
          });
        }
      }
      next({ name: "loginError", message: "User not found" });
    } catch (error) {
      next({ name: "loginError", message: error });
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { oldPassword, newPassword, confirmPassword } = req.body;

      const { email } = req.user;

      const user = await User.findOne({ email }).select("+password");

      const validatePass = validatePassword(newPassword);

      if (validatePass.length > 0)
        return next({
          name: "validationError",
          message: validatePass,
          path: "reset",
        });

      if (comparePassword(oldPassword, user.password)) {
        if (newPassword !== confirmPassword) {
          return next({
            name: "validationError",
            message: "your confirmation password do not match!",
            path: "reset",
          });
        } else if (newPassword === oldPassword) {
          return next({
            name: "validationError",
            message: "your old password and new password cannot be the same!",
            path: "reset",
          });
        } else {
          await user.update({
            password: hashPassword(newPassword),
          });

          return res.render("reset", {
            message: "Password changed!",
            success: true,
          });
        }
      } else {
        return next({
          name: "validationError",
          message: "your old password is wrong!",
          path: "reset",
        });
      }
    } catch (error) {
      next(error);
    }
  }

  static async register(req, res, next) {
    try {
      const { email, password, name } = req.body;

      const validatePass = validatePassword(password);

      if (validatePass.length > 0)
        return next({
          name: "registerError",
          message: validatePass,
          path: "register",
        });

      const token = crypto.randomBytes(16).toString("hex");

      const user = await User.create({
        name,
        email,
        password: hashPassword(password),
      });

      if (!user)
        return next({
          name: "registerError",
          message: "Email already registered",
        });

      const dataToken = await Token.create({
        userId: user._id,
        tokenEmail: token,
      });

      const emailContent =
        "<div style='width: 100%;background-color: #e0e0e0;padding: 30px 0;margin:0 auto'>" +
        "<div style = 'width: 80%;padding:30px;background-color: blue;margin:0 auto' > " +
        `<a href="${config.baseURL}/user/token_verification/${dataToken.tokenEmail}">` +
        " <p style = 'margin-bottom: 0px;margin-top: 0px;text-align: center;color:white;font-size: 16px;' > Account Activation</p>" +
        "</a></div></div>";

      let mail = await sendMail({
        subject: "Activation token",
        content: emailContent,
        receiver: user.email,
      });
      res.render("login", {
        success: true,
        googleLink,
        message: `Verification token has been sent to: ${user.email} `,
      });
    } catch (err) {
      next({ name: "registerError", message: err });
    }
  }

  static async tokenVerification(req, res, next) {
    try {
      const tokenEmail = req.params.tokenId;

      const dataToken = await Token.findOne({ tokenEmail });

      if (!dataToken) {
        await req.flash(
          "loginError",
          `Couldnt find your authentication token, or your token is expired `
        );
        return res.redirect("/");
      }

      const user = await User.findById(dataToken.userId);

      if (!user) {
        await req.flash(
          "loginError",
          "Your email is not found! Please register"
        );
        return res.redirect("/");
      }

      if (user.isVerified) {
        req.flash("loginError", "Your email is already verified");
      } else {
        user.update({ isVerified: true }).exec();
      }
      return res.redirect("/");
    } catch (err) {
      next(err);
    }
  }

  static async resendToken(req, res, next) {
    try {
      const { email } = req.user;

      const user = await User.findOne({ email });

      if (!user) res.redirect("/");

      const token = crypto.randomBytes(16).toString("hex");

      const dataToken = await Token.create({
        userId: user._id,
        tokenEmail: token,
      });

      const emailContent =
        "<div style='width: 100%;background-color: #e0e0e0;padding: 30px 0;margin:0 auto'>" +
        "<div style = 'width: 80%;padding:30px;background-color: blue;margin:0 auto' > " +
        `<a href="${config.baseURL}/user/token_verification/${dataToken.tokenEmail}">` +
        " <p style = 'margin-bottom: 0px;margin-top: 0px;text-align: center;color:white;font-size: 16px;' > Account Activation</p>" +
        "</a></div></div>";

      let mail = await sendMail({
        subject: "Resend Activation token",
        content: emailContent,
        receiver: user.email,
      });
      res.status(201).json({
        message: `Verification token has been sent to: ${user.email} `,
      });
      return res.redirect(`${config.baseURL}/`);
    } catch (err) {
      next(err);
    }
  }

  static async logout(req, res, next) {
    try {
      let user = req.user;

      await User.findByIdAndUpdate(
        { _id: user._id },
        { isOnline: false, lastSession: Date.now() }
      );

      req.user = {};
      res.clearCookie("accesstoken");
      return res.redirect("/");
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserController;
