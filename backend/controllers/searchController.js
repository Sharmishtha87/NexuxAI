const Repository = require("../models/repoModel");
const User = require("../models/userModel");

async function searchGlobal(req, res) {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Query parameter 'q' is required" });

  try {
    const regex = new RegExp(q, "i"); // Case-insensitive search

    const repos = await Repository.find({
      $or: [{ name: regex }, { description: regex }],
      visibility: true // Only search public repos
    }).populate("owner", "username profilePicture");

    const users = await User.find({
      $or: [{ username: regex }, { email: regex }]
    }).select("-password");

    res.json({ repositories: repos, users });
  } catch (err) {
    console.error("Error searching:", err.message);
    res.status(500).send("Server error");
  }
}

async function exploreRepositories(req, res) {
  try {
    // Return the latest 10 public repositories
    const repos = await Repository.find({ visibility: true })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("owner", "username profilePicture");

    res.json(repos);
  } catch (err) {
    console.error("Error fetching explore data:", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  searchGlobal,
  exploreRepositories,
};
