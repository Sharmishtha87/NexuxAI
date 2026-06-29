const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

async function redirectGithub(req, res) {
  if (!GITHUB_CLIENT_ID) {
    return res.status(500).json({ error: "GITHUB_CLIENT_ID is not configured." });
  }
  const redirectUri = "http://localhost:3000/auth/github/callback";
  const authUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=user:email,repo`;
  res.redirect(authUrl);
}

async function handleCallback(req, res) {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send("No code provided by GitHub");
  }

  try {
    // 1. Exchange code for access token
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: "http://localhost:3000/auth/github/callback",
      }),
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.status(400).send("Failed to get access token from GitHub");
    }

    // 2. Fetch user profile
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `token ${accessToken}`,
      },
    });
    const githubUser = await userResponse.json();

    // 3. Fetch user emails to ensure we have a primary email
    let primaryEmail = githubUser.email;
    if (!primaryEmail) {
      const emailResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `token ${accessToken}`,
        },
      });
      const emails = await emailResponse.json();
      const primary = emails.find((e) => e.primary && e.verified);
      primaryEmail = primary ? primary.email : emails[0].email;
    }

    if (!primaryEmail) {
      return res.status(400).send("No email found on GitHub account");
    }

    // 4. Find or Create User in DB
    let user = await User.findOne({ email: primaryEmail });
    if (!user) {
      // Create a new user
      user = new User({
        username: githubUser.login, // GitHub username
        email: primaryEmail,
        bio: githubUser.bio || "",
        profilePicture: githubUser.avatar_url || "",
        password: "", // Oauth users won't have a local password
        githubAccessToken: accessToken,
      });
      await user.save();
    } else {
      // Update missing fields just in case
      let updated = false;
      if (!user.profilePicture) {
        user.profilePicture = githubUser.avatar_url;
        updated = true;
      }
      if (user.githubAccessToken !== accessToken) {
        user.githubAccessToken = accessToken;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    }

    // 5. Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );

    // 6. Redirect to frontend with token and userId
    res.redirect(`http://localhost:5173/auth/callback?token=${token}&userId=${user._id}`);
  } catch (error) {
    console.error("OAuth Error:", error);
    res.status(500).send("Internal Server Error during GitHub OAuth");
  }
}

module.exports = {
  redirectGithub,
  handleCallback,
};
