const mongoose = require("mongoose");

const accessLogSchema = new mongoose.Schema(
  {
    tokenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VotingToken",
    },
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
    action: {
      type: String,
      enum: [
        "link_opened",
        "vote_submitted",
        "invalid_token",
        "reused_token_attempt",
        "suspicious_device"
      ],
      required: true,
    },
    isSuspicious: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AccessLog", accessLogSchema);