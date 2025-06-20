// middleware/authMiddleware.js

/**
 * Authentication middleware. Checks if the user is logged in via session or cookie.
 * If not, redirects to the login page.
 */
export function authenticate(req, res, next) {
  if (req.session.loggedIn) {
    return next();
  }
  // If session is not active, check for cookie and restore session
  if (req.cookies.loggedIn && req.cookies.loggedInUser) {
    req.session.loggedIn = true;
    req.session.user = req.cookies.loggedInUser;
    return next();
  }
  // User is not logged in, redirect to the login page
  res.redirect("/");
}

/**
 * Middleware to check if the user is already logged in.
 * If logged in, redirects to the upload page.
 */
export function checkLoggedIn(req, res, next) {
  if (req.session.loggedIn) {
    return res.redirect("/upload");
  }
  next();
}
