const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // No header present
    if (!authHeader) {
      return res.status(401).json({ message: "Missing token" });
    }

    // Format: "Bearer token"
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token not found" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Fetch user from DB
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user; // Attach user to request
    next(); // Continue to next route

  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { verifyToken };
