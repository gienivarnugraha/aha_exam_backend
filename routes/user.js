const express = require("express");

const UserController = require("../controllers/userController.js");
const { authentication } = require("../middlewares/authentication.js");

const router = express.Router();

router.get("/token_verification/:tokenId", UserController.tokenVerification);

router.post("/register", UserController.register);

router.post("/login", UserController.login);

router.get("/resend_token", authentication, UserController.resendToken);

router.post("/reset_password", authentication, UserController.resetPassword);

//router.get("/", authentication, UserController.getUserData);

router.get("/logout", authentication, UserController.logout);

router.get("/logout", authentication, UserController.logout);

module.exports = router;
