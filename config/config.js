require("dotenv").config();

module.exports = {
  // The secret for the encryption of the jsonwebtoken
  JWTsecret: process.env.JWT_SECRET,
  apiUrl: process.env.API_URL,
  port: process.env.PORT,
  gmail_account: process.env.GMAIL_ACCOUNT,
  gmail_secret: process.env.GMAIL_SECRET,
  database: process.env.PG_URI,
  // The credentials and information for OAuth2
  oauth2: {
    client_id: process.env.GOOGLE_CLIENT_ID,
    project_id: process.env.GOOGLE_PROJECT_ID, // The name of your project
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    access_token: process.env.GOOGLE_ACCESS_TOKEN,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    redirect_uris: [`${process.env.CLIENT_URL}/login`],
    scopes: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ],
  },
  facebook: {
    client_id: process.env.FACEBOOK_CLIENT_ID,
    client_secret: process.env.FACEBOOK_SECRET, //
    redirect_uri: `${process.env.CLIENT_URL}/login`,
  },
};
