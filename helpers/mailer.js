require("dotenv").config();

const nodemailer = require("nodemailer");
const google = require("googleapis").google;
const OAuth2 = google.auth.OAuth2;

const config = require("../config/config.js");

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    config.oauth2.client_id,
    config.oauth2.client_secret,
    config.oauth2.redirect_uris[0]
  );

  oauth2Client.setCredentials({
    refresh_token: config.oauth2.refresh_token,
  });

  /* const accessToken = await new Promise((resolve, reject) => {
    try {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          reject(err);
        }
        resolve(token);
      });
    } catch (err) {
      console.log(err);
    }
  }); */

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: config.gmail_account,
      clientId: config.oauth2.client_id,
      clientSecret: config.oauth2.client_secret,
      refreshToken: config.oauth2.refresh_token,
      accessToken: config.oauth2.access_token,
    },
  });

  return transporter;
};

const sendMail = ({ subject, content, receiver }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let messageOptions = {
        from: "admin <noreply@aha_test.id>",
        to: receiver,
        subject: `${subject}`,
        html: content,
      };

      let newTransporter = await createTransporter();

      newTransporter.sendMail(messageOptions, (info) => {
        return resolve(info);
      });
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { sendMail };
