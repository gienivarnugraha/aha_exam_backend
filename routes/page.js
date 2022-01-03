const express = require("express");
const pageController = require("../controllers/pageController.js");

const { authentication } = require("../middlewares/authentication.js");

// init express router
const router = express.Router();

router.get("/", pageController.loginPage);

router.get("/register", pageController.registerPage);

router.get("/dashboard", authentication, pageController.dashboardPage);

router.get("/reset_password", authentication, pageController.resetPasswordPage);

router.get("/auth_callback", pageController.googleAuthCallback);

// export default router
module.exports = router;
