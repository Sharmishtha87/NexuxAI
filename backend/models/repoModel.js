const mongoose = require("mongoose");
const { Schema } = mongoose;

const RepositorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    websiteUrl: {
      type: String,
    },
    content: [
      {
        type: String,
      },
    ],
    visibility: {
      type: Boolean,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issues: [
      {
        type: Schema.Types.ObjectId,
        ref: "Issue",
      },
    ],
    forkedFrom: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      default: null,
    },
    starCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Repository = mongoose.model("Repository", RepositorySchema);
module.exports = Repository;