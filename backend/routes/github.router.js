const express = require("express");
const githubController = require("../controllers/githubController");

const githubRouter = express.Router();

githubRouter.post("/github/sync-profile", githubController.syncProfile);
githubRouter.get("/github/repos/:githubUsername", githubController.fetchUserRepos);

module.exports = githubRouter;
