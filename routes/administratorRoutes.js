const express = require("express");
const jwt = require("jsonwebtoken");
const { requireAdministratorAuth } = require("../middleware/requireAdministratorAuth");
const Organization = require("../models/Organization");
const User = require("../models/User");
const Task = require("../models/Task");

const router = express.Router();


router.get("/stats", requireAdministratorAuth, async (req, res) => {
  try {
    const totalOrganizations = await Organization.countDocuments();
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalEmployees = await User.countDocuments({ role: "employee" });
    const activeOrganizations = await Organization.countDocuments(); // Assume all are active for now

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
    const organizations = await Organization.find().lean();
    
    const enrichedOrgs = await Promise.all(
      organizations.map(async (org) => {
        const admin = await User.findOne({ organization: org._id, role: "admin" }).lean();
        const employees = await User.find({ organization: org._id, role: "employee" }).lean();
        
        return {
          _id: org._id,
          name: org.name,
          createdAt: org.createdAt,
          adminName: admin ? admin.name : "N/A",
          adminEmail: admin ? admin.email : "N/A",
          totalEmployees: employees.length,
          employees: employees,
          status: "Active"
        };
      })
    );

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
    await Task.deleteMany({ organization: id });

    // Delete all users associated with this organization (both admin and employees)
    await User.deleteMany({ organization: id });

    // Delete the organization
    await Organization.findByIdAndDelete(id);

    res.json({ message: "Organization and all associated data deleted successfully" });
  } catch (error) {
    console.error("Error deleting organization:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
