const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
var ObjectId = require("mongodb").ObjectId;
const Commit = require("../models/commitModel");

const path = require("path");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const cloudinary = require("cloudinary").v2;
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/githubclone";

let client;

async function connectClient() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
}

async function signup(req, res) {
  const { username, password, email } = req.body;
  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ username });
    if (user) {
      return res.status(400).json({ message: "User already exists!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      username,
      password: hashedPassword,
      email,
      repositories: [],
      followedUsers: [],
      starRepos: [],
    };

    const result = await usersCollection.insertOne(newUser);

    const token = jwt.sign(
      { id: result.insertedId },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1h" }
    );
    res.json({ token, userId: result.insertedId });
  } catch (err) {
    console.error("Error during signup : ", err.message);
    res.status(500).send("Server error: " + err.message);
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials!" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ token, userId: user._id });
  } catch (err) {
    console.error("Error during login : ", err.message);
    res.status(500).send("Server error: " + err.message);
  }
}

async function getAllUsers(req, res) {
  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const users = await usersCollection.find({}).toArray();
    res.json(users);
  } catch (err) {
    console.error("Error during fetching : ", err.message);
    res.status(500).send("Server error!");
  }
}

async function getUserProfile(req, res) {
  const currentID = req.params.id;

  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({
      _id: new ObjectId(currentID),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    const followersCount = await usersCollection.countDocuments({
      followedUsers: new ObjectId(currentID)
    });

    const followingCount = user.followedUsers ? user.followedUsers.length : 0;

    let isFollowing = false;
    if (req.query.loggedInUserId) {
      try {
        const loggedInUser = await usersCollection.findOne({ _id: new ObjectId(req.query.loggedInUserId) });
        if (loggedInUser && loggedInUser.followedUsers) {
          isFollowing = loggedInUser.followedUsers.some(id => id.toString() === currentID);
        }
      } catch (e) {
        console.error("Invalid loggedInUserId", e);
      }
    }

    res.send({
      ...user,
      followersCount,
      followingCount,
      isFollowing
    });
  } catch (err) {
    console.error("Error during fetching : ", err.message);
    res.status(500).send("Server error!");
  }
}

async function updateUserProfile(req, res) {
  const currentID = req.params.id;
  const { email, password, bio, profilePicture, college, linkedin, instagram } = req.body;

  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    let updateFields = {};
    if (email) updateFields.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.password = hashedPassword;
    }
    
    if (bio !== undefined) updateFields.bio = bio;
    
    if (profilePicture !== undefined) {
      if (profilePicture.startsWith("data:image") || profilePicture.startsWith("data:application")) {
        try {
          const uploadResponse = await cloudinary.uploader.upload(profilePicture, {
            folder: "githubclone_profiles",
          });
          updateFields.profilePicture = uploadResponse.secure_url;
        } catch (uploadError) {
          console.error("Cloudinary upload failed:", uploadError);
          return res.status(500).json({ message: "Image upload failed!" });
        }
      } else {
        updateFields.profilePicture = profilePicture;
      }
    }

    if (college !== undefined) updateFields.college = college;
    if (req.body.course !== undefined) updateFields.course = req.body.course;
    if (req.body.branch !== undefined) updateFields.branch = req.body.branch;
    if (req.body.year !== undefined) updateFields.year = req.body.year;
    if (req.body.semester !== undefined) updateFields.semester = req.body.semester;
    if (linkedin !== undefined) updateFields.linkedin = linkedin;
    if (instagram !== undefined) updateFields.instagram = instagram;
    if (req.body.leetcode !== undefined) updateFields.leetcode = req.body.leetcode;
    if (req.body.portfolio !== undefined) updateFields.portfolio = req.body.portfolio;
    if (req.body.resume !== undefined) updateFields.resume = req.body.resume;
    if (req.body.theme !== undefined) updateFields.theme = req.body.theme;

    const result = await usersCollection.findOneAndUpdate(
      {
        _id: new ObjectId(currentID),
      },
      { $set: updateFields },
      { returnDocument: "after" }
    );
    
    // Newer MongoDB drivers return the document directly, older return it inside .value
    const updatedUser = result && result.value ? result.value : result;
    
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.send(updatedUser);
  } catch (err) {
    console.error("Error during updating : ", err.message);
    res.status(500).send("Server error!");
  }
}

async function deleteUserProfile(req, res) {
  const currentID = req.params.id;

  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const result = await usersCollection.deleteOne({
      _id: new ObjectId(currentID),
    });

    if (result.deleteCount == 0) {
      return res.status(404).json({ message: "User not found!" });
    }

    res.json({ message: "User Profile Deleted!" });
  } catch (err) {
    console.error("Error during updating : ", err.message);
    res.status(500).send("Server error!");
  }
}

async function getUserCommits(req, res) {
  const currentID = req.params.id;
  try {
    const commits = await Commit.find({ userId: currentID }).sort({ createdAt: 1 });
    res.json(commits);
  } catch (err) {
    console.error("Error fetching commits:", err.message);
    res.status(500).send("Server error!");
  }
}

async function saveFCMToken(req, res) {
  const currentID = req.params.id;
  const { fcmToken } = req.body;

  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    await usersCollection.updateOne(
      { _id: new ObjectId(currentID) },
      { $set: { fcmToken } }
    );
    res.json({ message: "FCM Token saved successfully" });
  } catch (err) {
    console.error("Error saving FCM Token:", err.message);
    res.status(500).send("Server error!");
  }
}

const { sendNotification } = require("../firebase-admin");

async function sendTestNotification(req, res) {
  const currentID = req.params.id;

  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ _id: new ObjectId(currentID) });

    if (!user || !user.fcmToken) {
      return res.status(404).json({ message: "User not found or no FCM token registered." });
    }

    const success = await sendNotification(
      user.fcmToken,
      "Test Notification! 🚀",
      "Firebase Cloud Messaging is successfully configured and working."
    );

    if (success) {
      res.json({ message: "Test notification sent successfully!" });
    } else {
      res.status(500).json({ message: "Failed to send notification. Check backend logs." });
    }
  } catch (err) {
    console.error("Error in sendTestNotification:", err.message);
    res.status(500).send("Server error!");
  }
}

async function toggleFollow(req, res) {
  const targetUserId = req.params.id; // User being followed/unfollowed
  const followerId = req.body.followerId; // User who clicked the button

  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const targetUser = await usersCollection.findOne({ _id: new ObjectId(targetUserId) });
    const followerUser = await usersCollection.findOne({ _id: new ObjectId(followerId) });

    if (!targetUser || !followerUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const isFollowing = followerUser.followedUsers && followerUser.followedUsers.some(id => id.toString() === targetUserId);

    if (isFollowing) {
      // Unfollow
      await usersCollection.updateOne(
        { _id: new ObjectId(followerId) },
        { $pull: { followedUsers: new ObjectId(targetUserId) } }
      );
      res.json({ message: "User unfollowed successfully", isFollowing: false });
    } else {
      // Follow
      await usersCollection.updateOne(
        { _id: new ObjectId(followerId) },
        { $addToSet: { followedUsers: new ObjectId(targetUserId) } }
      );
      res.json({ message: "User followed successfully", isFollowing: true });
    }
  } catch (err) {
    console.error("Error toggling follow:", err.message);
    res.status(500).send("Server error!");
  }
}

async function getFollowers(req, res) {
  const currentID = req.params.id;
  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const followers = await usersCollection.find({
      followedUsers: new ObjectId(currentID)
    }, { projection: { username: 1, email: 1, profilePicture: 1 } }).toArray();

    res.json(followers);
  } catch (err) {
    console.error("Error fetching followers:", err.message);
    res.status(500).send("Server error!");
  }
}

async function getFollowing(req, res) {
  const currentID = req.params.id;
  try {
    await connectClient();
    const db = client.db("githubclone");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ _id: new ObjectId(currentID) });
    
    if (!user || !user.followedUsers || user.followedUsers.length === 0) {
      return res.json([]);
    }

    const following = await usersCollection.find({
      _id: { $in: user.followedUsers }
    }, { projection: { username: 1, email: 1, profilePicture: 1 } }).toArray();

    res.json(following);
  } catch (err) {
    console.error("Error fetching following:", err.message);
    res.status(500).send("Server error!");
  }
}

module.exports = {
  getAllUsers,
  signup,
  login,
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
  getUserCommits,
  saveFCMToken,
  sendTestNotification,
  toggleFollow,
  getFollowers,
  getFollowing,
};