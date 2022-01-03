function validatePassword(value) {
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

module.exports = { validatePassword };
