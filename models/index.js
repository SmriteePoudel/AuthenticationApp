import mongoose from "mongoose";
import RoleSchema from "./Role.js";
import UserSchema from "./User.js";
import TaskSchema from "./Task.js";

export const Role = mongoose.models.Role || mongoose.model("Role", RoleSchema);
export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);
