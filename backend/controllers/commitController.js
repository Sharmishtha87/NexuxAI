const Commit = require("../models/commitModel");

async function getCommitsForRepo(req, res) {
  const { id } = req.params;
  try {
    const commits = await Commit.find({ repoId: id })
      .populate("userId", "username profilePicture")
      .sort({ createdAt: -1 });
    res.json(commits);
  } catch (err) {
    console.error("Error fetching commits:", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  getCommitsForRepo,
};
