const crypto = require("crypto");
const VotingToken = require("../models/VotingToken");
const User = require("../models/User");
const Poll = require("../models/Poll");
const AccessLog = require("../models/AccessLog");

exports.generateToken = async (req, res) => {
  try {
    const { pollId, assignedUserId, expiresAt } = req.body;

    if (!pollId || !assignedUserId) {
      return res.status(400).json({ message: "pollId and assignedUserId are required" });
    }

    const user = await User.findById(assignedUserId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "User is not verified" });
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    const tokenValue = crypto.randomBytes(24).toString("hex");

    const votingToken = await VotingToken.create({
      pollId,
      assignedUserId,
      token: tokenValue,
      expiresAt: expiresAt || null,
    });

    res.status(201).json({
      message: "Voting token generated successfully",
      votingToken,
      votingLink: `http://127.0.0.1:3000/api/tokens/validate/${tokenValue}`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to generate token",
      error: error.message,
    });
  }
};

exports.validateToken = async (req, res) => {
  try {
    const { token } = req.params;

    const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    const userAgent = req.headers["user-agent"] || "";

    const votingToken = await VotingToken.findOne({ token }).populate("pollId assignedUserId");

    if (!votingToken) {
      await AccessLog.create({
        ipAddress,
        userAgent,
        action: "invalid_token",
        isSuspicious: true,
      });

      return res.status(404).json({ message: "Invalid token" });
    }

    if (votingToken.isUsed) {
      await AccessLog.create({
        tokenId: votingToken._id,
        pollId: votingToken.pollId._id,
        ipAddress,
        userAgent,
        action: "reused_token_attempt",
        isSuspicious: true,
      });

      return res.status(400).json({ message: "Token already used" });
    }

    if (votingToken.expiresAt && new Date() > new Date(votingToken.expiresAt)) {
      return res.status(400).json({ message: "Token expired" });
    }

    if (!votingToken.registeredIp) {
      votingToken.registeredIp = ipAddress;
      votingToken.registeredUserAgent = userAgent;
      votingToken.deviceVerified = true;
      await votingToken.save();
    } else {
      const sameDevice = votingToken.registeredUserAgent === userAgent;

      if (!sameDevice) {
        await AccessLog.create({
          tokenId: votingToken._id,
          pollId: votingToken.pollId._id,
          ipAddress,
          userAgent,
          action: "suspicious_device",
          isSuspicious: true,
        });
      }
    }

    await AccessLog.create({
      tokenId: votingToken._id,
      pollId: votingToken.pollId._id,
      ipAddress,
      userAgent,
      action: "link_opened",
      isSuspicious: false,
    });

    res.json({
      message: "Token is valid",
      votingToken,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to validate token",
      error: error.message,
    });
  }
};

exports.getAllTokens = async (req, res) => {
  try {
    const tokens = await VotingToken.find()
      .populate("pollId", "title")
      .populate("assignedUserId", "fullName email isVerified verificationStatus")
      .sort({ createdAt: -1 });

    res.json(tokens);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch tokens",
      error: error.message,
    });
  }
};

exports.resendToken = async (req, res) => {
  try {
    const tokenDoc = await VotingToken.findById(req.params.id);

    if (!tokenDoc) {
      return res.status(404).json({ message: "Token not found" });
    }

    tokenDoc.resentCount += 1;
    tokenDoc.sentAt = new Date();

    await tokenDoc.save();

    res.json({
      message: "Token resent successfully",
      tokenDoc,
      votingLink: `http://127.0.0.1:3000/api/tokens/validate/${tokenDoc.token}`,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to resend token",
      error: error.message,
    });
  }
};