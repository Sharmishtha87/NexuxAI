const express = require("express");
const userController = require("../controllers/userController");

const userRouter = express.Router();

userRouter.get("/allUsers", userController.getAllUsers);
userRouter.post("/signup", userController.signup);
userRouter.post("/login", userController.login);
userRouter.get("/userProfile/:id", userController.getUserProfile);
userRouter.put("/updateProfile/:id", userController.updateUserProfile);
userRouter.delete("/deleteProfile/:id", userController.deleteUserProfile);
userRouter.get("/userProfile/:id/commits", userController.getUserCommits);
userRouter.put("/userProfile/:id/fcmToken", userController.saveFCMToken);
userRouter.post("/userProfile/:id/follow", userController.toggleFollow);
userRouter.get("/userProfile/:id/followers", userController.getFollowers);
userRouter.get("/userProfile/:id/following", userController.getFollowing);
userRouter.post("/testNotification/:id", userController.sendTestNotification);

module.exports = userRouter;