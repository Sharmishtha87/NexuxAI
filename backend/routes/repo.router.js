const express = require("express");
const repoController = require("../controllers/repoController");

const repoRouter = express.Router();

repoRouter.post("/repo/create", repoController.createRepository);
repoRouter.get("/repo/all", repoController.getAllRepositories);
repoRouter.get("/repo/:id", repoController.fetchRepositoryById);
repoRouter.get("/repo/name/:name", repoController.fetchRepositoryByName);
repoRouter.get("/repo/user/:userID", repoController.fetchRepositoriesForCurrentUser);
repoRouter.get("/repo/starred/:userID", repoController.fetchStarredRepositoriesForUser);
repoRouter.put("/repo/update/:id", repoController.updateRepositoryById);
repoRouter.delete("/repo/delete/:id", repoController.deleteRepositoryById);
repoRouter.patch("/repo/toggle/:id", repoController.toggleVisibilityById);
repoRouter.post("/repo/toggle-star/:id", repoController.toggleStarRepository);
repoRouter.post("/repo/fork/:id", repoController.forkRepository);
repoRouter.put("/repo/update-file/:id", repoController.updateFileInRepository);
repoRouter.post("/repo/upload-files/:id", repoController.uploadFileToRepository);
repoRouter.get("/repo/github-repos/:userId", repoController.getRealGithubRepos);
repoRouter.post("/repo/github-import/:userId", repoController.importRealGithubRepo);

module.exports = repoRouter;