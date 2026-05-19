const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    avatar: {
      type: String,
      default: "",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Generate default avatar URL if none provided
userSchema.pre("save", async function () {
  if (!this.avatar) {
    this.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      this.name
    )}&background=6366f1&color=fff&size=128`;
  }
});

module.exports = mongoose.model("User", userSchema);
