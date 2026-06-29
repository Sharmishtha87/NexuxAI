const User = require("../models/userModel");
const Commit = require("../models/commitModel");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function syncProfile(req, res) {
  const { githubUsername, userId } = req.body;
  
  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: "GITHUB_TOKEN is not configured in backend .env" });
  }

  try {
    const query = `
      query {
        user(login: "${githubUsername}") {
          name
          bio
          avatarUrl
          followers { totalCount }
          following { totalCount }
          contributionsCollection {
            contributionCalendar {
              totalContributions
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Authorization": `bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "GitHub-Clone-App"
      },
      body: JSON.stringify({ query })
    });

    const result = await response.json();
    if (result.errors) {
      return res.status(400).json({ error: result.errors[0].message });
    }

    const ghUser = result.data.user;

    // Sync commits if userId is provided
    if (userId && ghUser.contributionsCollection) {
      const weeks = ghUser.contributionsCollection.contributionCalendar.weeks;
      
      // Delete old synced commits
      await Commit.deleteMany({ userId, isSynced: true });
      
      // Prepare new synced commits
      const syncedCommits = [];
      weeks.forEach(week => {
        week.contributionDays.forEach(day => {
          if (day.contributionCount > 0) {
            for (let i = 0; i < day.contributionCount; i++) {
              syncedCommits.push({
                message: "Synced from GitHub",
                userId,
                isSynced: true,
                createdAt: new Date(day.date),
                updatedAt: new Date(day.date)
              });
            }
          }
        });
      });
      
      // Bulk insert using native collection to bypass mongoose auto-timestamps
      if (syncedCommits.length > 0) {
        const nativeCommits = syncedCommits.map(c => ({
          ...c,
          userId: new mongoose.Types.ObjectId(c.userId)
        }));
        await Commit.collection.insertMany(nativeCommits);
      }
    }

    res.json({
      name: ghUser.name,
      bio: ghUser.bio,
      avatarUrl: ghUser.avatarUrl,
      followersCount: ghUser.followers.totalCount,
      followingCount: ghUser.following.totalCount
    });

  } catch (error) {
    console.error("Error syncing GitHub profile:", error);
    res.status(500).json({ error: "Failed to sync with GitHub API" });
  }
}

async function fetchUserRepos(req, res) {
  const { githubUsername } = req.params;
  
  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: "GITHUB_TOKEN is not configured in backend .env" });
  }

  try {
    const query = `
      query {
        user(login: "${githubUsername}") {
          repositories(first: 20, orderBy: {field: STARGAZERS, direction: DESC}) {
            nodes {
              name
              description
              isPrivate
              primaryLanguage { name }
            }
          }
        }
      }
    `;

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Authorization": `bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        "User-Agent": "GitHub-Clone-App"
      },
      body: JSON.stringify({ query })
    });

    const result = await response.json();
    if (result.errors) {
      return res.status(400).json({ error: result.errors[0].message });
    }

    const repos = result.data.user.repositories.nodes;
    res.json(repos);

  } catch (error) {
    console.error("Error fetching GitHub repos:", error);
    res.status(500).json({ error: "Failed to fetch repos from GitHub API" });
  }
}

module.exports = {
  syncProfile,
  fetchUserRepos
};
