const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  bio: {
    type: String,
  },
  profilePicture: {
    type: String,
  },
  college: {
    type: String,
  },
  course: {
    type: String,
  },
  branch: {
    type: String,
  },
  year: {
    type: String,
  },
  semester: {
    type: String,
  },
  linkedin: {
    type: String,
  },
  instagram: {
    type: String,
  },
  leetcode: {
    type: String,
  },
  portfolio: {
    type: String,
  },
  resume: {
    type: String,
  },
  theme: {
    type: String,
    default: "default",
  },
  fcmToken: {
    type: String,
  },
  githubAccessToken: {
    type: String,
  },
  xp: {
    type: Number,
    default: 0,
  },
  badges: {
    type: [String],
    default: ["Early Adopter", "Code Contributor"],
  },
  repositories: [
    {
      default: [],
      type: Schema.Types.ObjectId,
      ref: "Repository",
    },
  ],
  followedUsers: [
    {
      default: [],
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  starRepos: [
    {
      default: [],
      type: Schema.Types.ObjectId,
      ref: "Repository",
    },
  ],
}, { timestamps: true });

const User = mongoose.model("User", UserSchema);

module.exports = User;