const express = require("express");
const searchController = require("../controllers/searchController");

const searchRouter = express.Router();

searchRouter.get("/search", searchController.searchGlobal);
searchRouter.get("/explore", searchController.exploreRepositories);

module.exports = searchRouter;
