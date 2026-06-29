const express = require("express");
const unstopController = require("../controllers/unstopController");

const unstopRouter = express.Router();

unstopRouter.get("/unstop-events", unstopController.getUnstopEvents);

module.exports = unstopRouter;
