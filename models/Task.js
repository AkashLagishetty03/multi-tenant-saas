const mongoose = require("mongoose");

const TASK_STATUSES = ["pending", "in-progress", "completed"];

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 500 },
    description: { type: String, trim: true, maxlength: 10000, default: "" },
    status: {
      type: String,
      enum: TASK_STATUSES,
      default: "pending",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    dueDate: { type: Date, default: null },
    submissionNotes: { type: String, trim: true, maxlength: 5000, default: "" },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

taskSchema.index({ organizationId: 1, status: 1 });

module.exports = mongoose.model("Task", taskSchema);
module.exports.TASK_STATUSES = TASK_STATUSES;
