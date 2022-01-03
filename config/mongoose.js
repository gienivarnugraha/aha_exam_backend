require("dotenv").config();

const mongoose = require("mongoose");

module.exports = mongoose
  .connect(process.env.MONGO_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`Mongoose Connect Successfuly`);
  })
  .catch((err) => {
    console.log(err);
    console.log(`Mongoose Connect Fail`);
  });
