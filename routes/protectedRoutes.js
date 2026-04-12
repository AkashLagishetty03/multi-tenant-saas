const express = require("express");
const { authenticate, requireSameOrganization } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * GET /api/dashboard
 * Requires valid JWT; tenant is implied by the token.
 */
router.get("/dashboard", authenticate, (req, res) => {
  res.json({
    message: "Dashboard data",
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      organizationId: req.user.organizationId,
    },
  });
});

/**
 * GET /api/organizations/:organizationId/tenant-summary
 * Example of same-organization enforcement for explicit org-scoped URLs.
 */
router.get(
  "/organizations/:organizationId/tenant-summary",
  authenticate,
  requireSameOrganization,
  (req, res) => {
    res.json({
      message: "Tenant-scoped resource",
      organizationId: req.params.organizationId,
    });
  }
);

module.exports = router;
