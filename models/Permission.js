import mongoose from "mongoose";

const PermissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    category: {
      type: String,
      enum: ["user", "role", "permission", "system", "other"],
      default: "other",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

PermissionSchema.index({ name: 1 });
PermissionSchema.index({ category: 1 });
PermissionSchema.index({ isActive: 1 });

export default PermissionSchema;
