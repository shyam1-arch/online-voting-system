const Poll = require("../models/Poll");
const PollOption = require("../models/PollOption");

exports.createPoll = async (req, res) => {
  try {
    const { title, description, createdBy, startAt, endAt } = req.body;

    if (!title || !createdBy) {
      return res.status(400).json({ message: "Title and createdBy are required" });
    }

    const poll = await Poll.create({
      title,
      description,
      createdBy,
      startAt,
      endAt,
    });

    res.status(201).json({
      message: "Poll created successfully",
      poll,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create poll", error: error.message });
  }
};

exports.addPollOption = async (req, res) => {
  try {
    const { pollId, optionText } = req.body;

    if (!pollId || !optionText) {
      return res.status(400).json({ message: "pollId and optionText are required" });
    }

    const option = await PollOption.create({
      pollId,
      optionText,
    });

    res.status(201).json({
      message: "Option added successfully",
      option,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to add option", error: error.message });
  }
};

exports.getAllPolls = async (req, res) => {
  try {
    const polls = await Poll.find().populate("createdBy", "fullName email role").sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch polls", error: error.message });
  }
};

exports.getSinglePoll = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate("createdBy", "fullName email role");

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    const options = await PollOption.find({ pollId: poll._id });

    res.json({
      poll,
      options,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch poll", error: error.message });
  }
};

exports.closePoll = async (req, res) => {
  try {
    const poll = await Poll.findByIdAndUpdate(
      req.params.id,
      { status: "closed" },
      { new: true }
    );

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    res.json({
      message: "Poll closed successfully",
      poll,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to close poll", error: error.message });
  }
};