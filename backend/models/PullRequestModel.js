const mongoose = require("mongoose");
const { Schema } = mongoose;

const PRSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  sourceRepo: { type: Schema.Types.ObjectId, ref: "Repository", required: true },
  targetRepo: { type: Schema.Types.ObjectId, ref: "Repository", required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["open", "merged", "closed"], default: "open" }
}, { timestamps: true });

module.exports = mongoose.model("PullRequest", PRSchema);
