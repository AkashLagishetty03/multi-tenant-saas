const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || !String(secret).trim()) {
    throw new Error("JWT_SECRET is not set in environment");
  }
  return secret;
}

/**
 * Verifies Bearer JWT and attaches the current user to `req.user` (password excluded).
 */
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    const token =
      header && header.startsWith("Bearer ") ? header.slice(7).trim() : null;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, getJwtSecret());
    } catch {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const userId = decoded.userId;
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const tokenOrg = decoded.organizationId ?? null;
    const userOrg = user.organizationId ? user.organizationId.toString() : null;
    if (tokenOrg !== userOrg) {
      return res.status(401).json({ message: "Token no longer valid for this user" });
    }

    if (!user.organizationId) {
      return res.status(403).json({ message: "User is not assigned to an organization" });
    }

    req.user = user;
    req.auth = {
      userId: user._id.toString(),
      role: user.role,
      organizationId: user.organizationId.toString(),
    };
    next();
  } catch (err) {
    if (err.message === "JWT_SECRET is not set in environment") {
      console.error(err.message);
      return res.status(500).json({ message: "Server authentication misconfiguration" });
    }
    next(err);
  }
}

/**
 * Ensures the requested organization id (param, body, or query) matches the authenticated user's org.
 * Use on routes that are scoped by `organizationId` (e.g. `/:organizationId/...`).
 */
function requireSameOrganization(req, res, next) {
  const requested =
    req.params.organizationId ??
    req.body?.organizationId ??
    req.query?.organizationId;

  if (!requested || !mongoose.isValidObjectId(String(requested))) {
    return res.status(400).json({ message: "Valid organizationId is required" });
  }

  if (!req.user?.organizationId) {
    return res.status(403).json({ message: "No organization membership" });
  }

  if (req.user.organizationId.toString() !== String(requested)) {
    return res.status(403).json({ message: "Access denied for this organization" });
  }

  next();
}

/**
 * Allows only users whose role is `"admin"`. Must run after `authenticate`.
 */
function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

module.exports = {
  authenticate,
  requireAdmin,
  requireSameOrganization,
  getJwtSecret,
};
