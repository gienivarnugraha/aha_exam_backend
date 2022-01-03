// * import google auth
const google = require("googleapis").google;
const OAuth2 = google.auth.OAuth2;

// * Import config
const config = require("../config/config.js");

const oauth2Client = new OAuth2(
  config.oauth2.client_id,
  config.oauth2.client_secret,
  `${config.baseURL}/auth_callback`
);

// Obtain the google login link to which we'll send our users to give us access
module.exports.googleLink = oauth2Client.generateAuthUrl({
  access_type: "offline", // Indicates that we need to be able to access data continously without the user constantly giving us consent
  scope: config.oauth2.scopes, // Using the access scopes from our oauth file
});
