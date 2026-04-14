const express = require("express");
const AccessLog = require("../models/AccessLog");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const logs = await AccessLog.find()
      .populate("tokenId")
      .populate("pollId", "title")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch logs", error: error.message });
  }
});

module.exports = router;