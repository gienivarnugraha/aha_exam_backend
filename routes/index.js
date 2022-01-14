const express = require("express");
const Controller = require("../controllers/index.js");

const { authentication } = require("../middlewares/authentication.js");
// init express router
const router = express.Router();
/*
// * redirect to login page if route not found
router.use(function (req, res, next) {
  res.status(404);

  // respond with html page
  if (req.accepts("html")) {
    //, { url: req.url }
    next({ error: true, message: "Page Not Found!" });
  }
}); */

router.post("/auth/google/", Controller.googleAuthCallback);

router.post("/auth/facebook", Controller.facebookAuthCallback);

router.post("/token_verification", Controller.tokenVerification);

router.post("/register", Controller.register);

router.post("/login", Controller.login);

router.post("/resend_token", Controller.resendToken);

router.put("/reset_password", authentication, Controller.resetPassword);

router.get("/user", authentication, Controller.getUserData);

router.get("/users", authentication, Controller.getAllUser);

router.put("/user", authentication, Controller.changeUserData);

router.get("/logout", authentication, Controller.logout);

router.get("/seed", Controller.seedUsers);

module.exports = router;
