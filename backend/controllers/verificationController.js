const VerificationRequest = require("../models/VerificationRequest");
const User = require("../models/User");
const Poll = require("../models/Poll");
const VotingToken = require("../models/VotingToken");
const crypto = require("crypto");
const { sendVotingEmail } = require("../config/mailer");

// upload document
exports.uploadDocument = async (req, res) => {
  try {
    const { userId, documentType } = req.body;

    if (!userId || !documentType) {
      return res.status(400).json({ message: "userId and documentType are required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Document file is required" });
    }

    const request = await VerificationRequest.create({
      userId,
      documentType,
      documentPath: req.file.path,
    });

    res.json({
      message: "Document uploaded",
      request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get all requests
exports.getRequests = async (req, res) => {
  try {
    const requests = await VerificationRequest.find()
      .populate("userId", "fullName email role isVerified verificationStatus")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// approve request + auto generate token + send email
exports.approveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await VerificationRequest.findById(id).populate("userId");

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "approved";
    await request.save();

    const user = await User.findByIdAndUpdate(
      request.userId._id,
      {
        isVerified: true,
        verificationStatus: "approved",
      },
      { new: true }
    );

    // find latest non-closed poll
    const poll = await Poll.findOne({
      status: { $in: ["draft", "active"] },
    }).sort({ createdAt: -1 });

    if (!poll) {
      return res.json({
        message: "Approved, but no active poll found. Token/email not sent.",
      });
    }

    const tokenValue = crypto.randomBytes(24).toString("hex");

    const votingToken = await VotingToken.create({
      pollId: poll._id,
      assignedUserId: user._id,
      token: tokenValue,
      expiresAt: poll.endAt || null,
    });

    await sendVotingEmail(user.email, tokenValue);

    res.json({
      message: "Approved and voting email sent successfully",
      votingToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// reject request
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await VerificationRequest.findById(id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "rejected";
    await request.save();

    await User.findByIdAndUpdate(request.userId, {
      isVerified: false,
      verificationStatus: "rejected",
    });

    res.json({ message: "Rejected" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};