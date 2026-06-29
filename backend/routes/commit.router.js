const express = require("express");
const commitController = require("../controllers/commitController");

const commitRouter = express.Router();

commitRouter.get("/commit/repo/:id", commitController.getCommitsForRepo);

module.exports = commitRouter;
