const express = require("express");
const eventsController = require("../controllers/eventsController");

const eventsRouter = express.Router();

eventsRouter.get("/all", eventsController.getAllEvents);

module.exports = eventsRouter;
