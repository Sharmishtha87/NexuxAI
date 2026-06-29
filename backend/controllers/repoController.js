const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");
const Commit = require("../models/commitModel");

async function createRepository(req, res) {
  const { owner, name, issues, content, description, visibility } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: "Repository name is required!" });
    }

    if (!mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(400).json({ error: "Invalid User ID!" });
    }

    const newRepository = new Repository({
      name,
      description,
      visibility,
      owner,
      content,
      issues,
    });

    const result = await newRepository.save();

    const initialCommit = new Commit({
      message: "Initial commit",
      repoId: result._id,
      userId: owner
    });
    await initialCommit.save();

    res.status(201).json({
      message: "Repository created!",
      repositoryID: result._id,
    });
  } catch (err) {
    console.error("Error during repository creation : ", err.message);
    res.status(500).send("Server error: " + err.message);
  }
}

async function getAllRepositories(req, res) {
  try {
    const repositories = await Repository.find({})
      .populate("owner")
      .populate("issues");

    res.json(repositories);
  } catch (err) {
    console.error("Error during fetching repositories : ", err.message);
    res.status(500).send("Server error: " + err.message);
  }
}

async function fetchRepositoryById(req, res) {
  const { id } = req.params;
  try {
    const repository = await Repository.find({ _id: id })
      .populate("owner")
      .populate("issues");

    res.json(repository);
  } catch (err) {
    console.error("Error during fetching repository : ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoryByName(req, res) {
  const { name } = req.params;
  try {
    const repository = await Repository.find({ name })
      .populate("owner")
      .populate("issues");

    res.json(repository);
  } catch (err) {
    console.error("Error during fetching repository : ", err.message);
    res.status(500).send("Server error");
  }
}

async function fetchRepositoriesForCurrentUser(req, res) {
  console.log(req.params);
  const { userID } = req.params;

  try {
    const repositories = await Repository.find({ owner: userID });

    if (!repositories || repositories.length == 0) {
      return res.status(404).json({ error: "User Repositories not found!" });
    }
    console.log(repositories);
    res.json({ message: "Repositories found!", repositories });
  } catch (err) {
    console.error("Error during fetching user repositories : ", err.message);
    res.status(500).send("Server error: " + err.message);
  }
}

async function fetchStarredRepositoriesForUser(req, res) {
  const { userID } = req.params;
  try {
    const user = await User.findById(userID);
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }
    const repositories = await Repository.find({ _id: { $in: user.starRepos } }).populate("owner");
    res.json({ message: "Starred Repositories found!", repositories });
  } catch (err) {
    console.error("Error during fetching starred repositories : ", err.message);
    res.status(500).send("Server error: " + err.message);
  }
}

async function updateRepositoryById(req, res) {
  const { id } = req.params;
  const { content, description, websiteUrl } = req.body;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    if (content) repository.content.push(content);
    if (description !== undefined) repository.description = description;
    if (websiteUrl !== undefined) repository.websiteUrl = websiteUrl;

    const updatedRepository = await repository.save();

    res.json({
      message: "Repository updated successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during updating repository : ", err.message);
    res.status(500).send("Server error");
  }
}

async function toggleVisibilityById(req, res) {
  const { id } = req.params;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    repository.visibility = !repository.visibility;

    const updatedRepository = await repository.save();

    res.json({
      message: "Repository visibility toggled successfully!",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during toggling visibility : ", err.message);
    res.status(500).send("Server error");
  }
}

async function deleteRepositoryById(req, res) {
  const { id } = req.params;
  try {
    const repository = await Repository.findByIdAndDelete(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    res.json({ message: "Repository deleted successfully!" });
  } catch (err) {
    console.error("Error during deleting repository : ", err.message);
    res.status(500).send("Server error");
  }
}

async function toggleStarRepository(req, res) {
  const { id } = req.params; // Repo ID
  const { userId } = req.body; 
  
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found!" });

    const repoIndex = user.starRepos.indexOf(id);
    let increment = 0;
    if (repoIndex === -1) {
      user.starRepos.push(id);
      increment = 1;
    } else {
      user.starRepos.splice(repoIndex, 1);
      increment = -1;
    }
    
    await user.save();
    const updatedRepo = await Repository.findByIdAndUpdate(id, { $inc: { starCount: increment } }, { new: true });

    res.json({ message: "Star toggled!", starRepos: user.starRepos, starCount: updatedRepo ? updatedRepo.starCount : 0 });
  } catch (err) {
    console.error("Error toggling star:", err.message);
    res.status(500).send("Server error");
  }
}

async function forkRepository(req, res) {
  const { id } = req.params; // Original repo ID
  const { userId } = req.body;

  try {
    const originalRepo = await Repository.findById(id);
    if (!originalRepo) return res.status(404).json({ error: "Original repository not found!" });

    const newRepository = new Repository({
      name: `${originalRepo.name}-forked`, // Simple naming to prevent conflicts, user can rename later
      description: originalRepo.description,
      visibility: originalRepo.visibility,
      owner: userId,
      content: originalRepo.content,
      issues: [],
      forkedFrom: id,
    });

    const result = await newRepository.save();

    res.status(201).json({
      message: "Repository forked successfully!",
      repositoryID: result._id,
    });
  } catch (err) {
    console.error("Error forking repository:", err.message);
    res.status(500).send("Server error");
  }
}

async function updateFileInRepository(req, res) {
  const { id } = req.params;
  const { filePath, fileContent, commitMessage, userId } = req.body;

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    let fileUpdated = false;
    for (let i = 0; i < repository.content.length; i++) {
      const fileObj = JSON.parse(repository.content[i]);
      if (fileObj.path === filePath) {
        fileObj.content = fileContent;
        repository.content[i] = JSON.stringify(fileObj);
        fileUpdated = true;
        break;
      }
    }

    if (!fileUpdated) {
      return res.status(404).json({ error: "File not found in repository!" });
    }

    // Tell Mongoose the array was modified since we changed an element by index
    repository.markModified("content");
    await repository.save();

    if (commitMessage && userId) {
      const newCommit = new Commit({
        message: commitMessage,
        repoId: id,
        userId: userId
      });
      await newCommit.save();
    }

    res.json({ message: "File updated successfully!" });
  } catch (err) {
    console.error("Error updating file:", err.message);
    res.status(500).send("Server error");
  }
}

async function uploadFileToRepository(req, res) {
  const { id } = req.params;
  const { files, userId } = req.body; // Expecting an array of { path, content }

  try {
    const repository = await Repository.findById(id);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found!" });
    }

    for (const newFile of files) {
      let fileExists = false;
      for (let i = 0; i < repository.content.length; i++) {
        const fileObj = JSON.parse(repository.content[i]);
        if (fileObj.path === newFile.path) {
          // Overwrite
          fileObj.content = newFile.content;
          repository.content[i] = JSON.stringify(fileObj);
          fileExists = true;
          break;
        }
      }
      
      if (!fileExists) {
        repository.content.push(JSON.stringify({ path: newFile.path, content: newFile.content }));
      }
    }

    repository.markModified("content");
    await repository.save();

    if (userId) {
      const newCommit = new Commit({
        message: `Uploaded ${files.length} file(s)`,
        repoId: id,
        userId: userId
      });
      await newCommit.save();
    }

    res.json({ message: "Files uploaded successfully!", repository });
  } catch (err) {
    console.error("Error uploading files:", err.message);
    res.status(500).send("Server error");
  }
}

const axios = require("axios");
const JSZip = require("jszip");

async function getRealGithubRepos(req, res) {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user || !user.githubAccessToken) {
      return res.status(400).json({ error: "User is not authenticated with GitHub." });
    }

    const response = await axios.get("https://api.github.com/user/repos?per_page=100&sort=updated", {
      headers: {
        Authorization: `token ${user.githubAccessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const repos = response.data.map(repo => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      private: repo.private,
      description: repo.description,
      html_url: repo.html_url,
    }));

    res.json({ repos });
  } catch (err) {
    console.error("Error fetching GitHub repos:", err.message);
    res.status(500).json({ error: "Failed to fetch repositories from GitHub." });
  }
}

async function importRealGithubRepo(req, res) {
  const { userId } = req.params;
  const { githubRepoFullName, repoName, description, visibility } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user || !user.githubAccessToken) {
      return res.status(400).json({ error: "User is not authenticated with GitHub." });
    }

    // Download the ZIP archive from GitHub
    const zipUrl = `https://api.github.com/repos/${githubRepoFullName}/zipball`;
    const response = await axios.get(zipUrl, {
      headers: {
        Authorization: `token ${user.githubAccessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      responseType: "arraybuffer",
    });

    const zip = await JSZip.loadAsync(response.data);
    const content = [];
    let fileCount = 0;
    
    // We iterate over the files in the zip
    for (const [filename, fileObj] of Object.entries(zip.files)) {
      if (!fileObj.dir) {
        // Entry name includes the root folder (e.g. owner-repo-hash/folder/file.js)
        // We strip the first directory to get the relative path
        const parts = filename.split("/");
        parts.shift(); // Remove root directory
        const relativePath = parts.join("/");
        
        if (relativePath) {
          // Prevent massive repos from crashing MongoDB (limit to 1000 files)
          if (fileCount > 1000) break;

          const fileData = await fileObj.async("base64");
          let mimeType = "text/plain"; // Default
          if (relativePath.endsWith(".js") || relativePath.endsWith(".jsx")) mimeType = "text/javascript";
          else if (relativePath.endsWith(".html")) mimeType = "text/html";
          else if (relativePath.endsWith(".css")) mimeType = "text/css";
          else if (relativePath.endsWith(".json")) mimeType = "application/json";
          else if (relativePath.endsWith(".md")) mimeType = "text/markdown";
          else if (relativePath.endsWith(".png")) mimeType = "image/png";
          else if (relativePath.endsWith(".jpg") || relativePath.endsWith(".jpeg")) mimeType = "image/jpeg";
          
          content.push(JSON.stringify({
            path: relativePath,
            content: `data:${mimeType};base64,${fileData}`
          }));
          fileCount++;
        }
      }
    }

    const newRepository = new Repository({
      name: repoName,
      description: description || `Imported from ${githubRepoFullName}`,
      visibility: visibility || true,
      owner: userId,
      content,
      issues: [],
    });

    const result = await newRepository.save();

    const initialCommit = new Commit({
      message: `Initial commit: Imported from ${githubRepoFullName}`,
      repoId: result._id,
      userId: userId
    });
    await initialCommit.save();

    res.status(201).json({
      message: "Repository imported successfully!",
      repositoryID: result._id,
    });
  } catch (err) {
    console.error("Error importing GitHub repo:", err.message);
    let errorMessage = err.message;
    if (err.response && err.response.data) {
      errorMessage = err.response.data.message || err.response.data;
    } else if (err.code === 11000) {
      errorMessage = "A repository with this name already exists in your database.";
    }
    res.status(500).json({ error: errorMessage });
  }
}

module.exports = {
  createRepository,
  getAllRepositories,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoriesForCurrentUser,
  fetchStarredRepositoriesForUser,
  updateRepositoryById,
  toggleVisibilityById,
  deleteRepositoryById,
  toggleStarRepository,
  forkRepository,
  updateFileInRepository,
  uploadFileToRepository,
  getRealGithubRepos,
  importRealGithubRepo,
};