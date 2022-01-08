/* function validatePassword(value) {
  let messages = [];

  messages[0] =
    /[A-Z]/.test(value) || "Password should contain uppercase letter";
  messages[1] =
    /[a-z]/.test(value) || "Password should contain lowercase letter";
  messages[2] = /\d/.test(value) || "Password should contain numeric";
  messages[3] =
    /[!@#$%^&*]/.test(value) || "Password should contain special character";
  messages[4] = value.length > 8 || "Password length at least 8 characters";

  return messages.filter((msg) => msg !== true);
}
 */
const Validator = require("validatorjs");

Validator.register(
  "contain_digit",
  function (value) {
    return /[0-9]/.test(value);
  },
  "Should contain numeric character."
);

Validator.register(
  "contain_lower",
  function (value) {
    return /[a-z]/.test(value);
  },
  "Should contain lowercase character."
);

Validator.register(
  "contain_upper",
  function (value) {
    return /[A-Z]/.test(value);
  },
  "Should contain uppercase character."
);

Validator.register(
  "contain_special",
  function (value) {
    return /[!@#$%^&*]/.test(value);
  },
  "Should contain special !@#$%^&* character."
);

module.exports = Validator;
