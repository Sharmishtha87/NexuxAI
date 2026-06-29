const express = require("express");
const aiRouter = express.Router();
const aiController = require("../controllers/aiController");

aiRouter.post("/review-repo/:id", aiController.generateReview);
aiRouter.post("/generate-description", aiController.generateDescription);
aiRouter.post("/review-pr/:id", aiController.generatePRReview);
aiRouter.post("/generate-bios", aiController.generateBios);

module.exports = aiRouter;
