// * Import modules
const crypto = require("crypto");
const axios = require("axios");

const { google } = require("googleapis");

// * Import helpers
const { tokenGenerate } = require("../helpers/jwt.js");
const { comparePassword, hashPassword } = require("../helpers/bcrypt.js");
const { oauth2Client } = require("../helpers/google.js");
const { sendMail } = require("../helpers/mailer.js");
const Validator = require("../helpers/validator.js");
const { findOrCreateUser } = require("../helpers/db.js");

// * Import Models
const User = require("../models/index.js").User;
const Token = require("../models/index.js").Token;

// * Import config
const config = require("../config/config.js");

class Controller {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      let rules = {
        email: "required|email",
        password:
          "required|contain_lower|contain_upper|contain_special|contain_digit|min:8",
      };

      let validation = new Validator(req.body, rules);

      if (validation.fails()) {
        return next({
          name: "validationError",
          message: validation.errors,
        });
      }

      const user = await User.findOne({ where: { email } });

      if (user !== null) {
        if (comparePassword(password, user.password)) {
          await user.update({
            isOnline: true,
          });
          await user.increment("loginTimes");

          const accesstoken = tokenGenerate({ id: user.id });

          res.cookie("accesstoken", accesstoken);

          return res.status(200).json({ accesstoken, user });
        } else {
          return next({
            name: "validationError",
            message: { errors: { password: "your password is wrong!" } },
          });
        }
      }
      next({
        name: "loginError",
        message: "User not found, please register!",
      });
    } catch (error) {
      next({ name: "loginError", message: error });
    }
  }

  static async resetPassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;

      let rules = {
        oldPassword: "required",
        newPassword:
          "required|different:oldPassword|contain_lower|contain_upper|contain_special|contain_digit|min:8",
        confirmPassword:
          "required|same:newPassword|contain_lower|contain_upper|contain_special|contain_digit|min:8",
      };

      let validation = new Validator(req.body, rules);

      if (validation.fails()) {
        return next({
          name: "validationError",
          message: validation.errors,
        });
      }

      const { email } = req.user;

      const user = await User.findOne({ where: { email } });

      if (comparePassword(oldPassword, user.password)) {
        await user.update({
          password: hashPassword(newPassword),
          isPasswordDefault: false,
        });

        return res.json({
          message: "Password changed!",
          success: true,
        });
      } else {
        return next({
          name: "validationError",
          message: { errors: { oldPassword: "Your old password is wrong!" } },
        });
      }
    } catch (error) {
      next(error);
    }
  }

  static async register(req, res, next) {
    try {
      const { email, password, name } = req.body;

      let rules = {
        email: "required|email",
        password:
          "required|contain_lower|contain_upper|contain_special|contain_digit|min:8",
        passwordConfirmation:
          "required|contain_lower|contain_upper|contain_special|contain_digit|min:8|same:password",
      };

      let validation = new Validator(req.body, rules);

      if (validation.fails()) {
        return next({
          name: "validationError",
          message: validation.errors,
        });
      }

      const token = crypto.randomBytes(16).toString("hex");

      const user = await User.create({
        name,
        email,
        password: hashPassword(password),
      });

      await Token.create({
        userId: user.id,
        tokenEmail: token,
      });

      await sendMail({
        subject: "Activation token",
        content: token,
        receiver: user.email,
      });

      res.status(201).json({
        success: true,
        message: `Verification token has been sent to: ${user.email} `,
        token: token,
      });
    } catch (err) {
      console.log(err);
      return next({
        name: "registerError",
        message: "Email already registered",
      });
    }
  }

  static async tokenVerification(req, res, next) {
    try {
      const { token } = req.body;

      const dataToken = await Token.findOne({
        where: { tokenEmail: token },
      });

      if (!dataToken) {
        next({
          name: "loginError",
          message: `Couldnt find your authentication token, or your token is expired `,
        });
      }

      const user = await User.findByPk(dataToken.userId);

      if (!user) {
        next({
          name: "loginError",
          message: "Your email is not found! Please register",
        });
      }

      if (!user.isVerified) {
        await user.update({
          isVerified: true,
        });
      }

      await user.update({
        isOnline: true,
      });

      await user.increment("loginTimes");

      const accesstoken = tokenGenerate({ id: user.id });

      console.log(accesstoken);

      return res.status(200).json({ accesstoken });
    } catch (err) {
      next(err);
    }
  }

  static async resendToken(req, res, next) {
    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });

      const token = crypto.randomBytes(16).toString("hex");

      await Token.create({
        userId: user.id,
        tokenEmail: token,
      });

      await sendMail({
        subject: "Resend Activation token",
        content: token,
        receiver: user.email,
      });

      return res.status(201).json({
        message: `Verification token has been sent to: ${user.email} `,
      });
    } catch (err) {
      next(err);
    }
  }

  static async logout(req, res, next) {
    try {
      let user = req.user;

      await User.update(
        { isOnline: false, lastSession: Date.now() },
        { where: { id: user.id } }
      );

      req.user = {};
      res.status(200).json({ message: "success" });
    } catch (err) {
      next(err);
    }
  }

  static async facebookAuthCallback(req, res, next) {
    try {
      const { code } = req.body;

      const token = await axios({
        url: "https://graph.facebook.com/v12.0/oauth/access_token",
        method: "get",
        params: {
          client_id: config.facebook.client_id,
          client_secret: config.facebook.client_secret,
          redirect_uri: config.facebook.redirect_uri,
          code,
        },
      });

      const { data } = await axios({
        url: "https://graph.facebook.com/me",
        method: "get",
        params: {
          fields: ["id", "email", "name"].join(","),
          access_token: token.data.access_token,
        },
      });
      let accesstoken = await findOrCreateUser(data);

      return res.status(201).json({ accesstoken });
    } catch (error) {
      next(error);
    }
  }

  // Callback from google auth page
  static async googleAuthCallback(req, res, next) {
    try {
      if (req.body.error) {
        // The user did not give us permission.
        return next({
          error: true,
          message: "Access to google account is not permitted",
        });
      } else {
        const { tokens } = await oauth2Client.getToken(req.body.code);

        if (!tokens) {
          return next({
            error: true,
            message: "token not found!",
          });
        }

        oauth2Client.setCredentials({
          refresh_token: tokens.refresh_token,
          access_token: tokens.access_token,
        });

        let client = google.oauth2({
          auth: oauth2Client,
          version: "v2",
        });

        const { data } = await client.userinfo.get();

        let accesstoken = await findOrCreateUser(data);

        return res.status(201).json({ accesstoken });
      }
    } catch (error) {
      console.log("error google", error);
      return next({
        error: true,
        message: "Something error!",
      });
    }
  }

  //* get logged in user data using access_token
  static async changeUserData(req, res, next) {
    try {
      const { user } = req;
      const { name } = req.body;

      await User.update({ name }, { where: { id: user.id } });

      return res.status(200).json({ message: `name changed to: ${name}` });
    } catch (err) {
      return next({
        error: true,
        message: err,
      });
    }
  }

  //* get logged in user data using access_token
  static async getUserData(req, res, next) {
    try {
      const { user } = req;

      return res.status(201).json(user);
    } catch (err) {
      return next({
        error: true,
        message: err,
      });
    }
  }
}

module.exports = Controller;
