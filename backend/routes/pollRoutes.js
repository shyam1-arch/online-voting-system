const express = require("express");
const {
  createPoll,
  addPollOption,
  getAllPolls,
  getSinglePoll,
  closePoll,
} = require("../controllers/pollController");

const router = express.Router();

router.post("/", createPoll);
router.post("/option", addPollOption);
router.get("/", getAllPolls);
router.get("/:id", getSinglePoll);
router.put("/close/:id", closePoll);

module.exports = router;