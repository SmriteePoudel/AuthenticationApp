import mongoose from "mongoose";
import { roles as allRoles, permissions as allPermissions } from "../roles.js";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, "Please enter a valid phone number"],
    },
    password: {
      type: String,
      required: true,
      minlength: [6, "Password must be at least 6 characters long"],
    },
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        default: [],
      },
    ],
    permissions: [
      {
        type: String,
        default: [],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ roles: 1 });

UserSchema.virtual("allPermissions").get(function () {
  return this.permissions || [];
});

UserSchema.methods.hasPermission = function (permission) {
  return this.permissions.includes(permission);
};

UserSchema.methods.hasAnyPermission = function (permissions) {
  return permissions.some((permission) =>
    this.permissions.includes(permission)
  );
};

UserSchema.methods.hasAllPermissions = function (permissions) {
  return permissions.every((permission) =>
    this.permissions.includes(permission)
  );
};

UserSchema.pre("save", async function (next) {
  // Ensure roles and permissions are always arrays
  if (!this.roles) this.roles = [];
  if (!this.permissions) this.permissions = [];

  // Synchronize permissions from roles
  if (this.roles.length > 0) {
    // Find role objects by value or _id
    let userRoles = [];
    if (typeof this.roles[0] === "object" && this.roles[0].value) {
      userRoles = this.roles;
    } else {
      // Try to match by value or _id
      userRoles = allRoles.filter(
        (r) => this.roles.includes(r.value) || this.roles.includes(r._id)
      );
    }
    // If user has superadmin, give all permissions
    if (userRoles.some((r) => r.value === "superadmin")) {
      this.permissions = [...allPermissions];
    } else {
      this.permissions = Array.from(
        new Set(userRoles.flatMap((r) => r.permissions || []))
      );
    }
  }
  next();
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
