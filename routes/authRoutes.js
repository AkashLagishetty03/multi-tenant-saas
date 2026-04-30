const express = require("express");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Organization = require("../models/Organization");
const { ROLES } = require("../models/User");
const { getJwtSecret, authenticate, requireAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function badRequest(res, message, details) {
  return res.status(400).json(details ? { message, details } : { message });
}

function signToken(user) {
  const payload = {
    userId: user._id.toString(),
    role: user.role,
    organizationId: user.organizationId ? user.organizationId.toString() : null,
  };
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
}

/**
 * POST /api/auth/register
 * Admin: creates organization and assigns user as owner.
 * Employee: must provide existing organizationId.
 */
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role, organizationName, organizationId } = req.body;

    if (!name || typeof name !== "string") {
      return badRequest(res, "name is required");
    }
    if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return badRequest(res, "Valid email is required");
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return badRequest(res, "Password must be at least 8 characters");
    }
    if (!role || !ROLES.includes(role)) {
      return badRequest(res, `role must be one of: ${ROLES.join(", ")}`);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail }).select("_id");
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    if (role === "admin") {
      if (!organizationName || typeof organizationName !== "string" || !organizationName.trim()) {
        return badRequest(res, "organizationName is required for admin registration");
      }

      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const user = new User({
          name: name.trim(),
          email: normalizedEmail,
          password,
          role: "admin",
          organizationId: null,
        });
        await user.save({ session });

        const org = new Organization({
          name: organizationName.trim(),
          ownerId: user._id,
        });
        await org.save({ session });

        user.organizationId = org._id;
        await user.save({ session });

        await session.commitTransaction();

        const token = signToken(user);
        return res.status(201).json({
          message: "Registered successfully",
          token,
          user: user.toJSON(),
          organization: { id: org._id, name: org.name },
        });
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    }

    // employee
    if (!organizationId || !mongoose.isValidObjectId(String(organizationId))) {
      return badRequest(res, "Valid organizationId is required for employee registration");
    }

    const org = await Organization.findById(organizationId).select("_id name");
    if (!org) {
      return badRequest(res, "Organization not found");
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: "employee",
      organizationId: org._id,
    });

    const token = signToken(user);
    return res.status(201).json({
      message: "Registered successfully",
      token,
      user: user.toJSON(),
      organization: { id: org._id, name: org.name },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    next(err);
  }
});

/**
 * POST /api/auth/login
 */
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return badRequest(res, "email and password are required");
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.organizationId) {
      return res.status(403).json({ message: "Account is not linked to an organization" });
    }

    const token = signToken(user);
    return res.json({
      message: "Login successful",
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/add-employee
 * Admin only. Creates an employee in the admin's organization with a default password.
 */
router.post("/add-employee", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return badRequest(res, "name is required");
    }
    if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
      return badRequest(res, "Valid email is required");
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail }).select("_id");
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: "Welcome@123",
      role: "employee",
      organizationId: req.user.organizationId,
    });

    return res.status(201).json({
      message: "Employee added successfully",
      user: user.toJSON(),
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already registered" });
    }
    next(err);
  }
});

/**
 * GET /api/auth/employees
 * Admin only. Lists all employees in the admin's organization.
 */
router.get("/employees", authenticate, requireAdmin, async (req, res, next) => {
  try {
    const employees = await User.find({
      organizationId: req.user.organizationId,
      role: "employee",
    })
      .select("name email role")
      .sort({ name: 1 })
      .lean();

    return res.json({ employees });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
