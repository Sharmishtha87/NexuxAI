const PullRequest = require("../models/PullRequestModel");
const Repository = require("../models/repoModel");

async function createPR(req, res) {
  const { title, description, sourceRepoId, targetRepoId, authorId } = req.body;

  try {
    const pr = new PullRequest({
      title,
      description,
      sourceRepo: sourceRepoId,
      targetRepo: targetRepoId,
      author: authorId,
    });
    await pr.save();
    res.status(201).json({ message: "Pull Request created!", pr });
  } catch (err) {
    console.error("Error creating PR:", err.message);
    res.status(500).send("Server error");
  }
}

async function getPRsForTargetRepo(req, res) {
  const { id } = req.params; // Target Repo ID
  try {
    const prs = await PullRequest.find({ targetRepo: id }).populate("author", "username profilePicture");
    res.json(prs);
  } catch (err) {
    console.error("Error fetching PRs:", err.message);
    res.status(500).send("Server error");
  }
}

async function updatePRStatus(req, res) {
  const { id } = req.params; // PR ID
  const { status } = req.body; // "merged" or "closed"

  try {
    const pr = await PullRequest.findById(id);
    if (!pr) return res.status(404).json({ error: "PR not found!" });

    if (status === "merged") {
      // Logic to actually merge contents
      const sourceRepo = await Repository.findById(pr.sourceRepo);
      const targetRepo = await Repository.findById(pr.targetRepo);

      if (sourceRepo && targetRepo) {
        // Very basic merge: replace target content with source content
        // A true git merge would compare diffs, but since our content is a flat JSON array, this is a substitute.
        targetRepo.content = sourceRepo.content;
        await targetRepo.save();
      }
    }

    pr.status = status;
    await pr.save();
    res.json({ message: `PR ${status}`, pr });
  } catch (err) {
    console.error("Error updating PR:", err.message);
    res.status(500).send("Server error");
  }
}

module.exports = {
  createPR,
  getPRsForTargetRepo,
  updatePRStatus,
};
