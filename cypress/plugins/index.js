require("dotenv").config();
require("../../config/mongoose.js");

const User = require("../../models/user.js");
const Token = require("../../models/token.js");
const { hashPassword } = require("../../helpers/bcrypt.js");

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
  config.baseUrl = "http://localhost:3000";
  config.pageLoadTimeout = 5000;

  config.env.gmailAccount = process.env.GMAIL_ACCOUNT;
  config.env.googleClientId = process.env.GOOGLE_CLIENT_ID;
  config.env.googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  on("task", {
    createUser() {
      return new Promise(async (resolve, reject) => {
        try {
          const findUser = await User.findOne({
            email: process.env.GMAIL_ACCOUNT,
          });

          if (findUser) {
            findUser.delete();
          }

          const result = await User.create({
            name: "test",
            email: process.env.GMAIL_ACCOUNT,
            password: hashPassword("admin"),
            isVerified: true,
          });

          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    },
    deleteUser() {
      return new Promise(async (resolve, reject) => {
        try {
          const user = await User.findOne({
            email: process.env.GMAIL_ACCOUNT,
          });

          if (user) {
            await Token.findOneAndDelete({
              userId: user._id,
            });
            user.delete();
          }

          resolve(null);
        } catch (err) {
          reject(err);
        }
      });
    },
  });

  return config;
};
