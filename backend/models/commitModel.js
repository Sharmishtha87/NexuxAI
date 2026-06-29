const mongoose = require("mongoose");
const { Schema } = mongoose;

const CommitSchema = new Schema({
  message: { type: String, required: true },
  repoId: { type: Schema.Types.ObjectId, ref: "Repository", required: false },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  isSynced: { type: Boolean, default: false },
  // We can track the specific files added/modified in this commit if we want, 
  // but just a message and timestamp serves as a basic history.
}, { timestamps: true });

module.exports = mongoose.model("Commit", CommitSchema);
