const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWT_SECRET || "campusfind-development-secret";

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication token is required." });
  }

  try {
    req.user = jwt.verify(token, jwtSecret);
    return next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired authentication token." });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access is required." });
  }

  return next();
}

module.exports = {
  authenticateToken,
  requireAdmin,
};
