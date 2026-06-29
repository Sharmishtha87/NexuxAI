const mongoose = require("mongoose");
const { Schema } = mongoose;

const IssueSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["open", "closed"],
    default: "open",
  },
  repository: {
    type: Schema.Types.ObjectId,
    ref: "Repository",
    required: true,
  },
  bounty: {
    type: Number,
    default: 0,
  },
  claimedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
}, { timestamps: true });

const Issue = mongoose.model("Issue", IssueSchema);
module.exports = Issue;