const Vote = require("../models/Vote");
const VotingToken = require("../models/VotingToken");
const Poll = require("../models/Poll");
const PollOption = require("../models/PollOption");

exports.castVote = async (req, res) => {
  try {
    const { token, optionId } = req.body;

    if (!token || !optionId) {
      return res.status(400).json({ message: "token and optionId are required" });
    }

    const tokenDoc = await VotingToken.findOne({ token });
    if (!tokenDoc) {
      return res.status(404).json({ message: "Invalid token" });
    }

    if (tokenDoc.isUsed) {
      return res.status(400).json({ message: "Token already used" });
    }

    if (tokenDoc.expiresAt && new Date() > new Date(tokenDoc.expiresAt)) {
      return res.status(400).json({ message: "Token expired" });
    }

    const poll = await Poll.findById(tokenDoc.pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    if (poll.status === "closed") {
      return res.status(400).json({ message: "Poll is closed" });
    }

    const option = await PollOption.findOne({
      _id: optionId,
      pollId: tokenDoc.pollId,
    });

    if (!option) {
      return res.status(404).json({ message: "Option not found for this poll" });
    }

    const vote = await Vote.create({
      pollId: tokenDoc.pollId,
      optionId,
      tokenId: tokenDoc._id,
    });

    tokenDoc.isUsed = true;
    tokenDoc.usedAt = new Date();
    await tokenDoc.save();

    res.status(201).json({
      message: "Vote cast successfully",
      vote,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to cast vote", error: error.message });
  }
};

exports.getPollResults = async (req, res) => {
  try {
    const pollId = req.params.pollId;

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    const options = await PollOption.find({ pollId });

    const results = [];

    for (const option of options) {
      const count = await Vote.countDocuments({
        pollId,
        optionId: option._id,
      });

      results.push({
        optionId: option._id,
        optionText: option.optionText,
        votes: count,
      });
    }

    res.json({
      pollId,
      pollTitle: poll.title,
      results,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch results", error: error.message });
  }
};