const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "active", "closed"],
      default: "draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startAt: {
      type: Date,
    },
    endAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Poll", pollSchema);