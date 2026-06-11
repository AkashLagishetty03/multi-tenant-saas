const express = require("express");
const jwt = require("jsonwebtoken");
const { requireAdministratorAuth } = require("../middleware/requireAdministratorAuth");
const Organization = require("../models/Organization");
const User = require("../models/User");
const Task = require("../models/Task");

const router = express.Router();


// Helper to perform the MongoDB aggregation pipeline for organizations
async function getAggregatedOrganizations() {
  return await Organization.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "organizationId",
        as: "users",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        createdAt: 1,
        status: { $literal: "Active" },
        admins: {
          $filter: {
            input: "$users",
            as: "user",
            cond: { $eq: ["$$user.role", "admin"] },
          },
        },
        employees: {
          $filter: {
            input: "$users",
            as: "user",
            cond: { $eq: ["$$user.role", "employee"] },
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        createdAt: 1,
        status: 1,
        admin: { $arrayElemAt: ["$admins", 0] },
        employees: {
          $map: {
            input: "$employees",
            as: "emp",
            in: {
              _id: "$$emp._id",
              name: "$$emp.name",
              email: "$$emp.email",
              role: "$$emp.role",
            },
          },
        },
        totalEmployees: { $size: "$employees" },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        createdAt: 1,
        status: 1,
        adminName: { $ifNull: ["$admin.name", null] },
        adminEmail: { $ifNull: ["$admin.email", null] },
        totalEmployees: 1,
        employees: 1,
      },
    },
  ]);
}

router.get("/stats", requireAdministratorAuth, async (req, res) => {
  try {
    const orgs = await getAggregatedOrganizations();
    const totalOrganizations = orgs.length;
    const activeOrganizations = orgs.filter((o) => o.status === "Active").length;
    const totalAdmins = orgs.filter((o) => o.adminName !== null).length;
    const totalEmployees = orgs.reduce((sum, o) => sum + o.totalEmployees, 0);

    res.json({
      totalOrganizations,
      totalAdmins,
      totalEmployees,
      activeOrganizations,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/administrator/organizations
router.get("/organizations", requireAdministratorAuth, async (req, res) => {
  try {
    const enrichedOrgs = await getAggregatedOrganizations();
    res.json(enrichedOrgs);
  } catch (error) {
    console.error("Error fetching organizations:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/administrator/organization/:id
router.delete("/organization/:id", requireAdministratorAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the organization
    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Delete all tasks associated with this organization
    await Task.deleteMany({ organizationId: id });

    // Delete all users associated with this organization (both admin and employees)
    await User.deleteMany({ organizationId: id });

    // Delete the organization
    await Organization.findByIdAndDelete(id);

    res.json({ message: "Organization and all associated data deleted successfully" });
  } catch (error) {
    console.error("Error deleting organization:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
