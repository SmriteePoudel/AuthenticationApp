import mongoose from "mongoose";

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

UserSchema.pre("save", function (next) {
  if (!this.roles) this.roles = [];
  if (!this.permissions) this.permissions = [];
  next();
});

export default UserSchema;
