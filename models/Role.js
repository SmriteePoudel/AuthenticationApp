import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-z0-9_-]+$/,
        "Role value can only contain lowercase letters, numbers, hyphens, and underscores",
      ],
    },
    label: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Label must be at least 2 characters long"],
      maxlength: [50, "Label cannot exceed 50 characters"],
    },
    permissions: [
      {
        type: String,
        default: [],
        trim: true,
      },
    ],
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

RoleSchema.index({ isActive: 1 });

RoleSchema.methods.hasPermission = function (permission) {
  return this.permissions.includes(permission);
};

RoleSchema.methods.addPermission = function (permission) {
  if (!this.permissions.includes(permission)) {
    this.permissions.push(permission);
  }
  return this;
};

RoleSchema.methods.removePermission = function (permission) {
  this.permissions = this.permissions.filter((p) => p !== permission);
  return this;
};

RoleSchema.pre("save", function (next) {
  if (!this.permissions) {
    this.permissions = [];
  }
  next();
});

export default RoleSchema;
