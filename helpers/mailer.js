require("dotenv").config();

const nodemailer = require("nodemailer");

const config = require("../config/config.js");

const createTransporter = async () => {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: true,
    //requireTLS: true,
    auth: {
      //user: config.gmail_account,
      //pass: config.gmail_secret,
      type: "OAuth2",
      clientId: config.oauth2.client_id,
      clientSecret: config.oauth2.client_secret,
      refreshToken: config.oauth2.refresh_token,
      accessToken: config.oauth2.access_token,
      expires: 1484314697598,
    },
    logger: true,
    transactionLog: true,
  });
};

const sendMail = ({ subject, content, receiver }) => {
  return new Promise(async (resolve, reject) => {
    try {
      const htmlContent =
        "<div style='width: 100%;background-color: #e0e0e0;padding: 30px 0;margin:0 auto'>" +
        "<div style = 'width: 80%;padding:30px;background-color: blue;margin:0 auto' > " +
        `<a href="${process.env.CLIENT_URL}/login?token=${content}">` +
        " <p style = 'margin-bottom: 0px;margin-top: 0px;text-align: center;color:white;font-size: 16px;' > Account Activation</p>" +
        "</a></div></div>";

      let messageOptions = {
        from: "admin <noreply@aha_test.id>",
        to: receiver,
        subject: `${subject}`,
        html: htmlContent,
      };

      let newTransporter = await createTransporter();

      newTransporter.sendMail(messageOptions, (err, info) => {
        if (err) return reject("err cb", { error: true, message: err });
        newTransporter.close();
        return resolve(info);
      });
    } catch (err) {
      console.log("err catch", err);
      reject({ error: true, message: err });
    }
  });
};

module.exports = { sendMail };
