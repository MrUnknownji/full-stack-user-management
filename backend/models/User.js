import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    age: { type: Number, required: true, min: 0 },
    email: { type: String, required: true, unique: true },
    address: { type: String, default: "" },
    married: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);
export default User;
