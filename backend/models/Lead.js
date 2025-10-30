const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      required: [true, "Source is required"],
      enum: {
        values: [
          "website",
          "facebook_ads",
          "google_ads",
          "referral",
          "events",
          "other",
        ],
        message:
          "Source must be one of: website, facebook_ads, google_ads, referral, events, other",
      },
    },
    status: {
      type: String,
      enum: {
        values: ["new", "contacted", "qualified", "lost", "won"],
        message: "Status must be one of: new, contacted, qualified, lost, won",
      },
      default: "new",
    },
    score: {
      type: Number,
      min: [0, "Score cannot be less than 0"],
      max: [100, "Score cannot be more than 100"],
      default: 0,
    },
    leadValue: {
      type: Number,
      min: [0, "Lead value cannot be negative"],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    assignedAt: {
      type: Date,
    },
    lastActivityAt: {
      type: Date,
    },
    isQualified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for employee assignment queries
leadSchema.index({ userId: 1, assignedTo: 1 });
leadSchema.index({ assignedTo: 1 });

// Compound index for user-specific email uniqueness
leadSchema.index({ userId: 1, email: 1 }, { unique: true });

// Index for common queries
leadSchema.index({ userId: 1, status: 1 });
leadSchema.index({ userId: 1, source: 1 });
leadSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Lead", leadSchema);
