const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");
const User = require("../models/User");
const { TASK_STATUSES } = require("../models/Task");
const {
  authenticate,
  requireSameOrganization,
  requireAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

function badRequest(res, message) {
  return res.status(400).json({ message });
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 100;

/**
 * Parses pagination query params. Omitted values use defaults; invalid values yield an error message.
 */
function parseListQuery(query) {
  const pageRaw = query.page;
  const limitRaw = query.limit;

  let page;
  if (pageRaw === undefined || pageRaw === "") {
    page = DEFAULT_PAGE;
  } else {
    const n = Number(pageRaw);
    if (!Number.isInteger(n) || n < 1) {
      return { error: "page must be a positive integer" };
    }
    page = n;
  }

  let limit;
  if (limitRaw === undefined || limitRaw === "") {
    limit = DEFAULT_LIMIT;
  } else {
    const n = Number(limitRaw);
    if (!Number.isInteger(n) || n < 1) {
      return { error: "limit must be a positive integer" };
    }
    if (n > MAX_LIMIT) {
      return { error: `limit must not exceed ${MAX_LIMIT}` };
    }
    limit = n;
  }

  return { page, limit };
}

/** Ensures `requireSameOrganization` sees the tenant from the JWT (not client input alone). */
function mergeUserOrganizationIntoQuery(req, res, next) {
  req.query = { ...req.query, organizationId: req.user.organizationId.toString() };
  next();
}

function mergeUserOrganizationIntoBody(req, res, next) {
  req.body = { ...(req.body || {}), organizationId: req.user.organizationId.toString() };
  next();
}

async function loadTaskInUserOrganization(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return badRequest(res, "Invalid task id");
    }

    const task = await Task.findOne({
      _id: id,
      organizationId: req.user.organizationId,
    });
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    req.task = task;
    req.query = { ...req.query, organizationId: req.user.organizationId.toString() };
    req.body = { ...(req.body || {}), organizationId: req.user.organizationId.toString() };
    next();
  } catch (err) {
    next(err);
  }
}

function parseOptionalDueDate(value) {
  if (value == null || value === "") {
    return { dueDate: null };
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return { error: "dueDate must be a valid date" };
  }
  return { dueDate: d };
}

async function resolveAssigneeInOrganization(assignedTo, organizationId) {
  if (assignedTo == null || assignedTo === "") {
    return null;
  }
  if (!mongoose.isValidObjectId(String(assignedTo))) {
    return { error: "assignedTo must be a valid user id" };
  }
  const user = await User.findOne({
    _id: assignedTo,
    organizationId,
  }).select("_id");
  if (!user) {
    return { error: "Assignee not found in this organization" };
  }
  return { id: user._id };
}

/**
 * POST /api/tasks
 * Admin only. organizationId comes from the authenticated user.
 */
router.post(
  "/",
  authenticate,
  mergeUserOrganizationIntoBody,
  requireSameOrganization,
  requireAdmin,
  async (req, res, next) => {
    try {
      const { title, description, assignedTo, status, dueDate: dueDateInput } = req.body;

      if (!title || typeof title !== "string" || !title.trim()) {
        return badRequest(res, "title is required");
      }

      if (status != null && !TASK_STATUSES.includes(status)) {
        return badRequest(res, `status must be one of: ${TASK_STATUSES.join(", ")}`);
      }

      const parsedDue = parseOptionalDueDate(dueDateInput);
      if (parsedDue.error) {
        return badRequest(res, parsedDue.error);
      }

      const assignee = await resolveAssigneeInOrganization(assignedTo, req.user.organizationId);
      if (assignee?.error) {
        return badRequest(res, assignee.error);
      }

      const task = await Task.create({
        title: title.trim(),
        description:
          description != null && typeof description === "string" ? description.trim() : "",
        status: status || "pending",
        dueDate: parsedDue.dueDate,
        assignedTo: assignee?.id ?? null,
        organizationId: req.user.organizationId,
        createdBy: req.user._id,
      });

      const populated = await Task.findOne({
        _id: task._id,
        organizationId: req.user.organizationId,
      })
        .populate("assignedTo", "name email role")
        .populate("createdBy", "name email role")
        .lean();

      return res.status(201).json(populated);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/tasks
 * All members: paginated tasks for the logged-in user's organization.
 * Query: page (default 1), limit (default 5), status (optional; one of TASK_STATUSES).
 */
router.get(
  "/",
  authenticate,
  mergeUserOrganizationIntoQuery,
  requireSameOrganization,
  async (req, res, next) => {
    try {
      const parsed = parseListQuery(req.query);
      if (parsed.error) {
        return badRequest(res, parsed.error);
      }
      const { page, limit } = parsed;

      const { status } = req.query;
      if (status != null && status !== "") {
        if (!TASK_STATUSES.includes(status)) {
          return badRequest(res, `status must be one of: ${TASK_STATUSES.join(", ")}`);
        }
      }

      const filter = { organizationId: req.user.organizationId };
      if (status != null && status !== "") {
        filter.status = status;
      }

      const skip = (page - 1) * limit;

      const [tasks, total] = await Promise.all([
        Task.find(filter)
          .populate("assignedTo", "name email role")
          .populate("createdBy", "name email role")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Task.countDocuments(filter),
      ]);

      const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

      return res.json({
        tasks,
        total,
        page,
        totalPages,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * PUT /api/tasks/:id
 * Update task status (organization-scoped).
 */
router.put(
  "/:id",
  authenticate,
  loadTaskInUserOrganization,
  requireSameOrganization,
  async (req, res, next) => {
    try {
      const { status, dueDate: dueDateInput } = req.body;
      if (status == null) {
        return badRequest(res, "status is required");
      }
      if (!TASK_STATUSES.includes(status)) {
        return badRequest(res, `status must be one of: ${TASK_STATUSES.join(", ")}`);
      }

      req.task.status = status;
      if (Object.prototype.hasOwnProperty.call(req.body, "dueDate")) {
        const parsedDue = parseOptionalDueDate(dueDateInput);
        if (parsedDue.error) {
          return badRequest(res, parsedDue.error);
        }
        req.task.dueDate = parsedDue.dueDate;
      }
      await req.task.save();

      const updated = await Task.findOne({
        _id: req.task._id,
        organizationId: req.user.organizationId,
      })
        .populate("assignedTo", "name email role")
        .populate("createdBy", "name email role")
        .lean();

      return res.json(updated);
    } catch (err) {
      next(err);
    }
  }
);

/**
 * DELETE /api/tasks/:id
 * Admin only, same organization.
 */
router.delete(
  "/:id",
  authenticate,
  loadTaskInUserOrganization,
  requireSameOrganization,
  requireAdmin,
  async (req, res, next) => {
    try {
      await Task.deleteOne({
        _id: req.task._id,
        organizationId: req.user.organizationId,
      });
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
