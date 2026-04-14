const mongoose = require("mongoose");

const voteSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
    },
    optionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PollOption",
      required: true,
    },
    tokenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VotingToken",
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vote", voteSchema);