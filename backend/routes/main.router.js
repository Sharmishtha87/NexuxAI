const express = require("express");
const userRouter = require("./user.router");
const repoRouter = require("./repo.router");
const issueRouter = require("./issue.router");
const prRouter = require("./pr.router");
const searchRouter = require("./search.router");
const commitRouter = require("./commit.router");
const eventsRouter = require("./events.router");
const aiRouter = require("./ai.router");
const githubRouter = require("./github.router");
const oauthRouter = require("./oauth.router");
const chatRouter = require("./chat.router");

const mainRouter = express.Router();

mainRouter.use(chatRouter);

mainRouter.use(userRouter);
mainRouter.use(repoRouter);
mainRouter.use(issueRouter);
mainRouter.use(prRouter);
mainRouter.use(searchRouter);
mainRouter.use(commitRouter);
mainRouter.use("/api/events", eventsRouter);
mainRouter.use("/events", eventsRouter);
mainRouter.use("/ai", aiRouter);
mainRouter.use(githubRouter);
mainRouter.use(oauthRouter);

// mainRouter.get("/", (req, res) => {
//   res.send("Welcome!");
// });

module.exports = mainRouter;