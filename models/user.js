const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name cannot be blank"],
    },
    email: {
      type: String,
      required: [true, `Email cannot be blank`],
      validate: [
        {
          validator: function (value) {
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value);
          },
          message: "Email is not valid!",
        },
      ],
      unique: true,
    },
    password: {
      type: String,
      select: false,
      required: [true, `Password cannot be blank`],
      validate: [
        {
          validator: function (value) {
            let array = [];

            return array;
          },
          message: function (props) {
            let error = [];

            if (props.array[0]) error.push("Must contain uppercase Letter");
            if (props.array[1]) error.push("Must contain lowercase Letter");
            if (props.array[2]) error.push("Must contain number");
            if (props.array[3]) error.push("Must contain special character");

            return error;
          },
        },
      ],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastSession: {
      type: Date,
      default: Date.now(),
    },
    loginTimes: {
      type: Number,
      default: 0,
    },
    registerSource: {
      type: String,
      default: "database",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false, strict: false }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
