const express = require("express");
const router = express.Router();
const nerController = require("../controllers/nerController");
const { validateNERRequest } = require("../middleware/validateRequest");

// Health check endpoint
router.get("/health", nerController.healthCheck);

// NER extraction endpoint
router.post("/extract", validateNERRequest, nerController.extractEntities);

module.exports = router;
