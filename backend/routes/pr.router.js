const express = require("express");
const prController = require("../controllers/prController");

const prRouter = express.Router();

prRouter.post("/pr/create", prController.createPR);
prRouter.get("/pr/target/:id", prController.getPRsForTargetRepo);
prRouter.patch("/pr/status/:id", prController.updatePRStatus);

module.exports = prRouter;
