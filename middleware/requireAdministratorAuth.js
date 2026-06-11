const jwt = require("jsonwebtoken");

const requireAdministratorAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "administrator") {
      return res.status(403).json({ message: "Forbidden: Not an administrator" });
    }

    const adminEmails = (process.env.ADMINISTRATOR_EMAILS || "")
      .split(",")
      .map((e) => e.trim());

    if (!adminEmails.includes(decoded.email)) {
      return res.status(403).json({ message: "Forbidden: Email not authorized" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = { requireAdministratorAuth };
