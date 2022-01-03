const express = require("express");
const userRouter = require("./user.js");
const pageRouter = require("./page.js");

// init express router
const router = express.Router();

router.use("/user", userRouter);

router.use(pageRouter);

// export default router
module.exports = router;
