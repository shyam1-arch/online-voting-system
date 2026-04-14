const express = require("express");
const multer = require("multer");

const {
  uploadDocument,
  getRequests,
  approveRequest,
  rejectRequest,
} = require("../controllers/verificationController");

const router = express.Router();

// file upload setup
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// routes
router.post("/upload", upload.single("document"), uploadDocument);
router.get("/", getRequests);
router.put("/approve/:id", approveRequest);
router.put("/reject/:id", rejectRequest);

module.exports = router;