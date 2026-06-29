const express = require("express");
const oauthController = require("../controllers/oauthController");

const oauthRouter = express.Router();

oauthRouter.get("/auth/github/login", oauthController.redirectGithub);
oauthRouter.get("/auth/github/callback", oauthController.handleCallback);

module.exports = oauthRouter;
