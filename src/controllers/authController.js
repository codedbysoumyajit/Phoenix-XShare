// controllers/authController.js
import bcrypt from "bcryptjs";
import config from "../../config/config.js";

/**
 * Renders the login page.
 */
export const renderLoginPage = (req, res) => {
  res.render("login");
};

/**
 * Handles user login.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 */
export const loginUser = async (req, res) => {
  const { username, password } = req.body;

if (username !== config.settings.loginUser) {
  return res.status(400).render("error", {
    errorMessage: "Invalid username or password.",
  });
}

const isMatch = await bcrypt.compare(password, config.settings.loginPass);

if (!isMatch) {
  return res.status(400).render("error", {
    errorMessage: "Invalid username or password.",
  });
}

req.session.user = username;
req.session.loggedIn = true;
res.cookie("loggedIn", true, {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  httpOnly: true,
});
res.cookie("loggedInUser", username, {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  httpOnly: true,
});

// *** MODIFIED PART ***
// Instead of redirecting, send a JSON response with the redirect URL
return res.status(200).json({ redirectUrl: '/upload' });

};
