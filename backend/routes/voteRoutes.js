const express = require("express");
const { castVote, getPollResults } = require("../controllers/voteController");

const router = express.Router();

router.post("/", castVote);
router.get("/results/:pollId", getPollResults);

module.exports = router;