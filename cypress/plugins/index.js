require("dotenv").config();
const db = require("../../models/index.js");

const User = db.User;
const Token = db.Token;
const { hashPassword } = require("../../helpers/bcrypt.js");
const { tokenGenerate } = require("../../helpers/jwt.js");

/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  config.baseUrl = process.env.CLIENT_URL;
  config.pageLoadTimeout = 5000;

  config.env.apiUrl = process.env.API_URL;
  config.env.gmailAccount = process.env.GMAIL_ACCOUNT;
  config.env.googleClientId = process.env.GOOGLE_CLIENT_ID;
  config.env.googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  config.env.googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  on("task", {
    async createUser() {
      try {
        const findUser = await User.findOne({
          where: {
            email: process.env.GMAIL_ACCOUNT,
          },
        });

        if (findUser) {
          findUser.destroy();
        }

        const result = await User.create({
          name: "test",
          email: process.env.GMAIL_ACCOUNT,
          password: hashPassword("Password123!"),
          isVerified: true,
        });

        return result;
      } catch (err) {
        console.log(err);
      }
    },
    async createAccessToken(userId) {
      try {
        return { accesstoken: tokenGenerate({ id: userId }) };
      } catch (error) {
        console.log(error);
      }
    },
    async findToken(tokenEmail) {
      try {
        const token = await Token.findOne({ where: { tokenEmail } });

        return token.tokenEmail;
      } catch (err) {
        console.log(err);
      }
    },
    async deleteUser() {
      try {
        const user = await User.findOne({
          where: {
            email: process.env.GMAIL_ACCOUNT,
          },
        });

        if (user) {
          await Token.destroy({
            where: {
              userId: user.id,
            },
          });
          await user.destroy({
            where: {
              id: user.id,
            },
          });
        }

        return null;
      } catch (err) {
        console.log(err);
      }
    },
  });

  return config;
};
